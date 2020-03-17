// https://readhub.cn/topics

import axios from 'axios';

import {Crawler, Page} from ".";

// 定义分页参数
type PageParam = {
  lastCursor?: number,
  pageSize: number
}

// 定义每页中单个记录类型
type PageItem = {
  id: string,
  title: string,
  order: number,
  hasInstantView: boolean
}

// 字义每页中的通用字段
type PageExtra = {
  pageSize: number,
  totalItems: number,
  totalPages: number
}

// 定义记录详情类型
type Detail = {
  url: string,
  title: string
}

// 初始化一个爬虫对象
const crawler = new Crawler<PageParam, PageItem, PageExtra, Detail>()

  // 设置分页查询参数
  .pageParam({lastCursor: null, pageSize: 20})

  // 设置下一页查询参数
  .nextPageParamFunc(({pageParams, prevPage}) => {
    if (!prevPage || !prevPage.data || !prevPage.data.length) {
      // 不需要再请求下一页了
      return null;
    }
    return {
      ...pageParams,
      lastCursor: prevPage.data[prevPage.data.length - 1].order
    }
  })

  // 设置分页查询函数
  .pageFunc(params => {
    return axios.get<Page<PageItem, PageExtra>>('https://api.readhub.cn/topic', {params})
      .then(res => {
        return res.data;
      });
  })

  // 设置查询详情的函数
  .detailFunc(({item}) => {
    if (!item.hasInstantView) {
      return null;
    }
    return axios.get('https://api.readhub.cn/topic/instantview', {
      params: {
        topicId: item.id
      }
    })
      .then(res => {
        return res.data;
      })
  });


(async () => {
  for await (const detail of crawler.all()) {
    // 处理详情对象
    console.log(detail);
  }
})();


