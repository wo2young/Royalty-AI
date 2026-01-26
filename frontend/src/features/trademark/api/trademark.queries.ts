import { useQuery, keepPreviousData } from "@tanstack/react-query"

// 값(Api) 타입(Params)을 두 줄로 나눠서
import { trademarkApi } from "./trademark.api"
import type { GetTrademarksParams } from "./trademark.api" 

import { trademarkKeys } from "./trademark.keys"

// 훅(Hook) 만들기: useTrademarks
export const useTrademarks = (params: GetTrademarksParams) => {
  return useQuery({
    // 1. 키 설정
    queryKey: trademarkKeys.list(JSON.stringify(params)),
    
    // 2. API 호출 함수 연결
    queryFn: () => trademarkApi.getTrademarks(params),
    
    // 3. 옵션
    placeholderData: keepPreviousData,
  })
}