// features/trademark/api/trademark.queries.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { trademarkApi } from "./trademark.api"
import { trademarkKeys } from "./trademark.keys"
import type { GetTrademarksParams } from "../types" // 타입 위치에 맞춰 수정

export const useTrademarks = (params: GetTrademarksParams) => {
  return useQuery({
    // 1. params가 변할 때마다 새로운 데이터를 fetching함
    queryKey: trademarkKeys.list(params),

    // 2. API 호출
    queryFn: () => trademarkApi.getTrademarks(params),

    // 3. 페이지네이션 시 다음 페이지 로딩 중에 이전 데이터를 보여줘서
    // 화면 깜빡임을 방지 (UX 향상)
    placeholderData: keepPreviousData,

    // 4. 데이터 유지 시간 및 재검색 방지 설정 (필요시)
    staleTime: 5 * 60 * 1000, // 5분 동안은 신선한 데이터로 간주
  })
}
