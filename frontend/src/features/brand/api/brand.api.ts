import { MOCK_BRAND_DETAILS, MOCK_MY_BRANDS_LIST } from "../constants/mock"
import type { Brand, BrandDetail } from "../types"

export const brandApi = {
  // GET /mypage/brand (목록 조회)
  fetchBrands: async (): Promise<Brand[]> => {
    /* 실제 서버 연동:
    const { data } = await axiosInstance.get<Brand[]>("/mypage/brand");
    return data;
    */
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_MY_BRANDS_LIST), 500)
    })
  },

  // GET /mypage/brand/{brandId} (상세 조회)
  fetchBrandById: async (brandId: number): Promise<BrandDetail> => {
    /* 실제 서버 연동:
    const { data } = await axiosInstance.get<Brand>(`/mypage/brand/${brandId}`);
    return data;
    */
    return new Promise((resolve, reject) => {
      const brand = MOCK_BRAND_DETAILS.find((b) => b.brandId === brandId)
      setTimeout(
        () => (brand ? resolve(brand) : reject(new Error("Not Found"))),
        300
      )
    })
  },

  // POST /mypage/brand (브랜드 등록)
  createBrand: async (brandData: FormData): Promise<Brand> => {
    /* 실제 서버 연동:
    const { data } = await axiosInstance.post<Brand>("/mypage/brand", brandData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
    */
    return new Promise((resolve) => {
      console.log("브랜드 등록 데이터:", brandData)

      // any 대신 Brand 타입의 필수 값을 채운 목데이터 반환
      const newBrand: Brand = {
        brandId: Date.now(),
        brandName: "새로운 브랜드",
        category: "IT",
        logoPath: "",
        notificationEnabled: false,
        description: "",
        createdAt: new Date().toISOString(),
      }

      setTimeout(() => resolve(newBrand), 500)
    })
  },

  // PATCH /mypage/brand/{brandId}/notification (알림 설정)
  toggleNotification: async (
    brandId: number,
    enabled: boolean
  ): Promise<{ brandId: number; notificationEnabled: boolean }> => {
    /* 실제 서버 연동:
    const { data } = await axiosInstance.patch(`/mypage/brand/${brandId}/notification`, {
      notificationEnabled: enabled 
    });
    return data;
    */
    return new Promise((resolve) => {
      setTimeout(() => resolve({ brandId, notificationEnabled: enabled }), 300)
    })
  },

  // DELETE /mypage/brand/{brandId} (브랜드 삭제)
  deleteBrand: async (brandId: number): Promise<{ success: boolean }> => {
    /* 실제 서버 연동:
    await axiosInstance.delete(`/mypage/brand/${brandId}`);
    return { success: true };
    */
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 300)
    })
  },
}
