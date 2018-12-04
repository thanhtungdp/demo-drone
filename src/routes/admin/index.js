const mongoose = require('mongoose')
const Joi = require('joi')
const Test = require('models/Test')
const { json } = require('micro')
const validation = require('@bit/tungtung.micro.components.micro-joi')
const { getQueryFromKey } = require('components/create-query-community')
const pagination = require('@bit/tungtung.micro.components.micro-crud/micro-crud/pagination')
const { testStatus, testMode } = require('../../constants')
const templateTestList = require('../../template')
const axios = require('axios')
const amqp = require('amqp')
const Excel = require('exceljs')

const createTestOrUpdateTestInfo = validation(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    time: Joi.number().required(),
    tags: Joi.array()
  })
)(async req => {
  const body = await json(req)
  let test
  if (req.params.testKey) {
    // Update
    const query = getQueryFromKey(req.params.testKey)
    test = await Test.updateTest(query, {
      ...body,
      step: 2
    })
    amqp.publish('TEST_UPDATE', test)
  } else {
    // Create
    test = await Test.create(body, req.user)

    amqp.publish('TEST_CREATED', {
      user: req.user
    })
    /**
     * import data to elasticsearch
     */
  }
  return test
})

module.exports = {
  create: createTestOrUpdateTestInfo,
  updateTestInfo: createTestOrUpdateTestInfo,
  updateQuestions: validation(
    Joi.object({
      questions: Joi.array().required(),
      pdfFile: Joi.string()
    })
  )(async req => {
    const body = await json(req)
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.updateTest(
      query,
      {
        questions: body.questions,
        pdfFile: body.pdfFile,
        totalQuestions: body.questions.length,
        step: 3
      },
      req.user
    )
    return updatedTest
  }),
  updateTestForm: validation(
    Joi.object({
      type: Joi.string().required(),
      openingTime: Joi.date(),
      closingTime: Joi.date(),
      showResultTime: Joi.date(),
      password: Joi.string(),
      price: Joi.number().required(),
      isCustomRank: Joi.boolean().required(),
      customRank: Joi.array(),
      mode: Joi.string().required(),
      featuredImage: Joi.string()
    })
  )(async req => {
    const body = await json(req)
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.updateTest(
      query,
      {
        ...body,
        step: 4
      },
      req.user
    )
    axios.post(
      process.env.SEARCH_SERVICE + '/quiz-list',
      {
        testList: updatedTest
      },
      {
        headers: {
          common: {
            ...req.headers
          }
        }
      }
    )
    return updatedTest
  }),
  submitForReview: async req => {
    // Gửi đề thi cho admin duyệt
    // Change testMode to PUBLIC, then change testStatus to NEED_REVIEW
    const query = getQueryFromKey(req.params.testKey)
    const updatedTest = await Test.updateTest(
      query,
      {
        mode: testMode.PUBLIC,
        status: testStatus.NEED_REVIEW,
        step: 4
      },
      req.user
    )
    return updatedTest
      ? {
        success: true,
        status: updatedTest.status,
        mode: updatedTest.mode
      }
      : {
        success: false
      }
  },
  getTestForUpdate: async req => {
    const query = getQueryFromKey(req.params.testKey)
    let test = await Test.findOne(query)
    return test
  },
  getTestListByCreated: pagination(async req => {
    const query = {
      $and: [
        { 'owner._id': mongoose.Types.ObjectId(req.user._id) },
        { status: { $nin: [testStatus.DRAFT] } }
      ]
    }
    return templateTestList(req, query)
  }),
  getTestListByDraft: pagination(async req => {
    const query = {
      'owner._id': mongoose.Types.ObjectId(req.user._id),
      status: testStatus.DRAFT
    }
    return templateTestList(req, query)
  }),
  getTestBookmark: pagination(async req => {
    let query = {
      'bookmarker._id': mongoose.Types.ObjectId(req.user._id)
    }
    return templateTestList(req, query)
  }),
  deleteTest: async req => {
    let query = {
      $and: [getQueryFromKey(req.params.testKey), { 'owner._id': req.user._id }]
    }
    let test = await Test.remove(query)
    return test
  },
  getTestInfo: async req => {
    let workbook = new Excel.Workbook()
    workbook.creator = 'Tung Tung'
    workbook.lastModifiedBy = 'Tung Tung'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()
    let sheet = workbook.addWorksheet('Tests')
    let fileName = `report.xlsx`
    sheet.columns = [
      { header: 'id', key: 'id', width: 25 },
      { header: 'Tên', key: 'title', width: 20 },
      { header: 'Slug', key: 'slug', width: 20 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Tag ID', key: 'score', width: 10, outlineLevel: 1 }
    ]

    let tests = await Test.find(
      { tags: { $size: 0 }, status: { $in: ['NEW', 'OLD'] } },
      { _id: 1, title: 1, slug: 1, description: 1 }
    ).limit(500)

    tests.map((test, index) => {
      // Add a couple of Rows by key-value, after the last current row, using the column keys
      sheet.addRow({
        id: test._id,
        title: test.title,
        slug: test.slug,
        description: test.description
      });
    })

    await workbook.xlsx.writeFile(fileName);
    return {file: fileName};
  }
}
