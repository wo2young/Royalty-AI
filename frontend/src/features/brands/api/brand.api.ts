import axiosInstance from "@/shared/api/axios"
import type { Brand, BrandBIData, BrandDetail } from "../types"

export const brandApi = {
  // GET /mypage/brand (목록 조회)
  fetchBrands: async (): Promise<Brand[]> => {
    const { data } = await axiosInstance.get<Brand[]>("/mypage/brand")
    return data
  },

  // POST /mypage/brand/{brandId} (브랜드 수정)
  updateBrand: async (
    brandId: number,
    brandData: FormData
  ): Promise<BrandDetail> => {
    const { data } = await axiosInstance.post<BrandDetail>(
      `/mypage/brand/${brandId}`,
      brandData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return data
  },

  // GET /mypage/brand/{brandId} (상세 조회)
  fetchBrandById: async (brandId: number): Promise<BrandDetail> => {
    const { data } = await axiosInstance.get<BrandDetail>(
      `/mypage/brand/${brandId}`
    )
    return data
  },

  // POST /mypage/brand (브랜드 등록)
  createBrand: async (brandData: FormData): Promise<Brand> => {
    const { data } = await axiosInstance.post<Brand>(
      "/mypage/brand",
      brandData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return data
  },

  // PATCH /mypage/brand/{brandId}/notification (알림 설정)
  toggleNotification: async (
    brandId: number,
    enabled: boolean
  ): Promise<{ brandId: number; notificationEnabled: boolean }> => {
    const { data } = await axiosInstance.patch(
      `/mypage/brand/${brandId}/notification`,
      null,
      {
        params: { enabled },
      }
    )
    return data
  },

  // DELETE /mypage/brand/{brandId} (브랜드 삭제)
  deleteBrand: async (brandId: number): Promise<{ success: boolean }> => {
    await axiosInstance.delete(`/mypage/brand/${brandId}`)
    return { success: true }
  },

  // GET /api/identity/{brandId} (BI 조회)
  fetchBrandIdentity: async (brandId: number): Promise<BrandBIData | null> => {
    const { data } = await axiosInstance.get(`/api/identity/${brandId}`)
    return data
  },

  // POST /api/identity/{brandId}/analyze (BI 분석)
  analyzeBrandIdentity: async (brandId: number): Promise<BrandBIData> => {
    const { data } = await axiosInstance.post(
      `/api/identity/${brandId}/analyze`
    )
    return data
  },

  // GET /api/mypage/brand/{brandId}/report  (리포트 다운로드)
  downloadReport: async (brandId: number): Promise<void> => {
    const response = await axiosInstance.get(
      `/mypage/brand/${brandId}/report`,
      { responseType: "blob" } // 반드시 blob 설정
    )

    // 서버에서 보낸 파일명 추출 (Content-Disposition 헤더 파싱)
    const contentDisposition = response.headers["content-disposition"]
    let fileName = "Brand_Report.pdf"

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename\*?=['"]?(?:UTF-8'')?([^;'"\n]*)['"]?/
      )
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1])
      }
    }

    // 브라우저 다운로드 처리
    const blob = new Blob([response.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()

    // 정리
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
