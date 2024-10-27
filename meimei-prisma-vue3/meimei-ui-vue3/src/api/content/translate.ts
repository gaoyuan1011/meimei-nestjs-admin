import request from '@/utils/request'

// 查询缓存详细
export function translate(body: { query: string, from: string, to: string } ) {
  return request({
    url: '/translate/text',
    method: 'post',
    data: body
  })
}