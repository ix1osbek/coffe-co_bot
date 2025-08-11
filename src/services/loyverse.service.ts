import axios, { AxiosError, AxiosInstance } from "axios";
import {
  LOYVERSE_API_BASEURL,
  LOYVERSE_API_SECRET,
} from "../config/environments";
import { IUpsertCustomer } from "../typings/interfaces/upsert-customer";
import { ICustomer } from "../typings/interfaces/customer";

class LoyverseService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: `${LOYVERSE_API_BASEURL}/v1.0`,
      headers: {
        Authorization: `Bearer ${LOYVERSE_API_SECRET}`,
        "Content-Type": "application/json",
      },
    });
  }

  async upsertCustomer(customer: IUpsertCustomer): Promise<ICustomer> {
    const res = await this.axios.post<ICustomer>("/customers", customer);

    return res.data;
  }

  async getCustomer(customer_id: string) {
    try {
      const res = await this.axios.get<ICustomer>(`/customers/${customer_id}`);

      return res.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }
}

export default new LoyverseService();
