import axiosInstance from "@/shared/api/axios"
import type { GetTrademarksParams } from "../types"

export const trademarkApi = {
  getTrademarks: async ({ page, query, category }: GetTrademarksParams) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("size", "10")

    if (query) params.append("keyword", query) // XML의 #{keyword}
    if (category && category !== "전체 카테고리")
      params.append("category", category)

    // GET /trademark/list?page=1&keyword=삼성...
    const { data } = await axiosInstance.get("/trademark/list", { params })
    return data
  },
}
