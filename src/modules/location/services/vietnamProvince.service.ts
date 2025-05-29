import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class VietnamProvinceService {
  constructor(private readonly httpService: HttpService) {}

  private async fetchProvinceApi(a: number, b: number) {
    const res = await this.httpService.axiosRef.get(
      `https://esgoo.net/api-tinhthanh/${a}/${b}.htm`,
    );

    return res.data;
  }

  async getProvinces() {
    return await this.fetchProvinceApi(1, 0);
  }

  async getDistricts(provinceId: number) {
    return await this.fetchProvinceApi(2, provinceId);
  }

  async getWards(districtId: number) {
    return await this.fetchProvinceApi(3, districtId);
  }

  async getFullByWard(wardId: number) {
    return await this.fetchProvinceApi(5, wardId);
  }
}
