import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { LocationResDtoType } from '../dtos';

@Injectable()
export class VietnamProvinceService {
  constructor(private readonly httpService: HttpService) {}

  private async fetchProvinceApi(
    a: number,
    b: number,
  ): Promise<LocationResDtoType> {
    const res = await this.httpService.axiosRef.get(
      `https://esgoo.net/api-tinhthanh/${a}/${b}.htm`,
    );

    return {
      isError: res.data.error,
      message: res.data.error_text,
      result: res.data.data,
    };
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
