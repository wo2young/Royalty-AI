// mock.ts

// 👇 위에서 만든 파일에서 타입을 가져옵니다. 경로가 맞는지 확인하세요.
import type { TrademarkDetail } from "../lib/trademark-data"

export const MOCK_TRADEMARKS: TrademarkDetail[] = [
  {
    patentId: 289640,
    trademarkName: "로열티(Royalty)",
    applicationNumber: "4020260000123",
    status: "공고",
    applicant: "주식회사 로열티팀",
    isBookmarked: true,
    applicationDate: "2024-12-01",
    agentName: "특허법인 로열티",
    viennaCode: "26.01.01",
    category: "IT",
    imageUrl: "C:\Users\ywk59\OneDrive\바탕 화면\나이키.png"
  },
  {
    patentId: 3,
    trademarkName: "삼성전자 삼성전자",
    applicationNumber: "4020250000003",
    status: "거절",
    applicant: "삼성전자주식회사",
    isBookmarked: false,
    applicationDate: "2025-01-26",
    agentName: "특허법인 로열티",
    viennaCode: "26.04.02",
    category: "IT",
    imageUrl: "C:\Users\ywk59\OneDrive\바탕 화면\이디야.png"
  },
  // ... (필요하다면 데이터 더 추가)
  {
    patentId: 301,
    trademarkName: "쿠팡 이츠",
    applicationNumber: "4020250000301",
    status: "등록",
    applicant: "쿠팡 주식회사",
    isBookmarked: true,
    applicationDate: "2023-10-10",
    agentName: "김로켓",
    viennaCode: "27.05.01",
    category: "커머스",
    imageUrl: "C:\Users\ywk59\OneDrive\바탕 화면\스타벅스.png"
  }
]