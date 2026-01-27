export const MOCK_MY_BRANDS_LIST = [
  {
    brandId: 1,
    brandName: "테크솔루션 주식회사",
    category: "IT · 플랫폼",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: true,
    description:
      "혁신적인 IT 솔루션을 제공하는 기업으로, 클라우드 서비스 및 AI 기반 소프트웨어 개발을 전문으로 합니다. 글로벌 시장 진출을 목표로 지속적인 기술 혁신을 이어가고 있습니다.",
    createdAt: "2020-01-15T00:00:00",
  },
  {
    brandId: 2,
    brandName: "이노베이션랩",
    category: "IT · 플랫폼",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2026-01-08T00:00:00",
  },
  {
    brandId: 3,
    brandName: "퓨처테크",
    category: "IT · 플랫폼",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-20T00:00:00",
  },
  {
    brandId: 4,
    brandName: "스마트솔루션",
    category: "IT · 플랫폼",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-15T00:00:00",
  },
  {
    brandId: 5,
    brandName: "디지털웍스",
    category: "CONTENT",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-10T00:00:00",
  },
  {
    brandId: 6,
    brandName: "클라우드허브",
    category: "PET",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-12-05T00:00:00",
  },
  {
    brandId: 7,
    brandName: "데이터플로우",
    category: "FINANCE",
    logoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-11-28T00:00:00",
  },
  {
    brandId: 8,
    brandName: "넥스트젠AI",
    category: "MANUFACTURING",
    logoPath: "",
    notificationEnabled: false,
    description: "",
    createdAt: "2025-11-20T00:00:00",
  },
]

export const MOCK_BRAND_DETAILS = [
  {
    brandId: 1,
    brandName: "테크솔루션 주식회사",
    category: "IT · 플랫폼",
    description: "혁신적인 AI 기반 클라우드 보안 솔루션을 제공합니다.",
    currentLogoPath:
      "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
    notificationEnabled: true,
    createdAt: "2026.01.15",
    historyList: [
      {
        historyId: 10,
        version: "v2",
        imageSimilarity: 12.5,
        textSimilarity: 85.0,
        createdAt: "2026-01-22T14:30:00",
        imagePath:
          "https://cdn.pixabay.com/photo/2017/11/24/21/49/bali-2975787_1280.jpg",
      },
      {
        historyId: 5,
        version: "v1",
        imageSimilarity: 45.8,
        textSimilarity: 10.2,
        createdAt: "2026-01-10T10:00:00",
        imagePath:
          "https://media.istockphoto.com/id/1419410282/ko/%EC%82%AC%EC%A7%84/%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B0%9D%EC%9D%80-%ED%83%9C%EC%96%91-%EA%B4%91%EC%84%A0%EC%9C%BC%EB%A1%9C-%EB%B4%84%EC%97%90%EC%84%9C-%EC%82%AC%EC%9D%BC%EB%9F%B0%ED%8A%B8-%EC%88%B2.jpg?s=1024x1024&w=is&k=20&c=lCk-jQ1gwuwMW2t36QRuNipt7ectlltg1POgWrXKvrw=",
      },
      {
        historyId: 4,
        version: "v3",
        imageSimilarity: 72.8,
        textSimilarity: 5.2,
        createdAt: "2026-01-24T10:00:00",
        imagePath:
          "https://media.istockphoto.com/id/1419410282/ko/%EC%82%AC%EC%A7%84/%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B0%9D%EC%9D%80-%ED%83%9C%EC%96%91-%EA%B4%91%EC%84%A0%EC%9C%BC%EB%A1%9C-%EB%B4%84%EC%97%90%EC%84%9C-%EC%82%AC%EC%9D%BC%EB%9F%B0%ED%8A%B8-%EC%88%B2.jpg?s=1024x1024&w=is&k=20&c=lCk-jQ1gwuwMW2t36QRuNipt7ectlltg1POgWrXKvrw=",
      },
      {
        historyId: 1,
        version: "v4",
        imageSimilarity: 62.8,
        textSimilarity: 27.2,
        createdAt: "2026-01-24T12:00:00",
        imagePath:
          "https://media.istockphoto.com/id/1419410282/ko/%EC%82%AC%EC%A7%84/%EC%95%84%EB%A6%84-%EB%8B%A4%EC%9A%B4-%EB%B0%9D%EC%9D%80-%ED%83%9C%EC%96%91-%EA%B4%91%EC%84%A0%EC%9C%BC%EB%A1%9C-%EB%B4%84%EC%97%90%EC%84%9C-%EC%82%AC%EC%9D%BC%EB%9F%B0%ED%8A%B8-%EC%88%B2.jpg?s=1024x1024&w=is&k=20&c=lCk-jQ1gwuwMW2t36QRuNipt7ectlltg1POgWrXKvrw=",
      },
    ],
    reportList: [
      {
        reportId: 101,
        title: "상표권 침해 가능성 및 로고 유사성 분석",
        summary:
          "현재 로고는 기존 IT 서비스 군의 상표들과 낮은 유사도를 보이고 있어 안정적입니다.",
        riskScore: 24,
        suggestions: ["메인 컬러 채도 조절", "폰트 독창성 확보"],
        createdAt: "2026-01-22T14:30:00",
      },
    ],
  },
  {
    brandId: 2,
    brandName: "이노베이션 메디컬",
    category: "IT · 플랫폼",
    description:
      "차세대 원격 진료 및 스마트 헬스케어 시스템을 개발하는 의료 전문 기업입니다.",
    currentLogoPath:
      "https://images.unsplash.com/photo-1505751172107-5739a00723a5?auto=format&fit=crop&q=80&w=200",
    notificationEnabled: true,
    createdAt: "2026.01.08",
    historyList: [], // 데이터 없는 상태 테스트용 (Empty State)
    reportList: [], // 데이터 없는 상태 테스트용 (Empty State)
  },
  {
    brandId: 3,
    brandName: "퓨처푸드 랩",
    category: "IT · 플랫폼",
    description:
      "지속 가능한 미래 식량을 연구하고 친환경 대체육 솔루션을 제안합니다.",
    currentLogoPath:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
    notificationEnabled: false,
    createdAt: "2025.12.20",
    historyList: [
      {
        historyId: 11,
        version: "v1",
        imageSimilarity: 88.2,
        textSimilarity: 95.0,
        createdAt: "2025-12-20T09:00:00",
      },
    ],
    reportList: [
      {
        reportId: 102,
        title: "신규 로고 시장 적합성 분석",
        summary:
          "식품 업계의 전형적인 그린 컬러를 사용하여 신뢰감을 주지만, 경쟁사와 로고 형태가 매우 유사하여 리스크가 높습니다.",
        riskScore: 78, // 리스크가 높은 케이스 테스트
        suggestions: ["로고 심볼의 차별화 필요", "보조 색상 도입 권장"],
        createdAt: "2025-12-25T11:00:00",
      },
    ],
  },
]

export const BrandBiData = [
  {
    brandId: 1,
    brandName: "삼성",
    identityPayload: {
      core: {
        kr: "삼성은 현대적이고 복잡한 상징형 로고를 가지고 있습니다.",
        en: "Samsung has a modern, complex symbolic logo.",
      },
      language: {
        kr: "한국어",
        en: "English",
      },
      brandKeywords: {
        kr: ["복잡한", "현대적인", "상징", "높은 대칭", "밝은 색조"],
        en: [
          "complex",
          "modern",
          "symbol",
          "high symmetry",
          "light color tone",
        ],
      },
      copyExamples: {
        kr: [
          "삼성의 로고는 현대적인 디자인과 복잡함이 돋보입니다.",
          "이 로고는 밝고 대칭적인 구조로 이루어져 있습니다.",
        ],
        en: [
          "Samsung's logo stands out with its modern design and complexity.",
          "This logo features a bright and symmetrical structure.",
        ],
      },
    },
    lastBrandName: "삼성",
    lastLogoId: 1,
    logoId: 1,
    logoImagePath: null,
  },
]
