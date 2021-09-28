import got, { Response } from "got";
import { Utils } from "@arkecosystem/crypto";
import ConfigService from "../services/config";
import { IApiResponse } from "../interfaces";

class ApiService {
    private async get(url: string, params?: any): Promise<IApiResponse> {
        const response: IApiResponse = await got.get(`${ConfigService.get("host")}/${url}`, params).json();

        return response;
    }

    private async post(url: string, params?: any): Promise<Response<IApiResponse>> {
        const response = await got.post(`${ConfigService.get("host")}/${url}`, {
            ...params,
            body: JSON.stringify(params.body),
            responseType: "json",
        });

        return response as Response<IApiResponse>;
    }

    public async blockchain() {
        const { data } = await this.get("blockchain");

        return data;
    }

    public async retrieveWallet(id: string) {
        const { data } = await this.get(`wallets/${id}`);

        return data;
    }

    public async retrieveDelegate(id: string) {
        const { data } = await this.get(`delegates/${id}`);

        return data;
    }

    public async retrieveVoters(vote: string, threshold: string) {
        const voters = [];

        let page = 1;
        let next = null;

        do {
            const searchParams = {
                "balance.from": Utils.BigNumber.make(Number(threshold) * 1e8).toFixed(),
                "attributes.vote": vote,
                page,
            };

            // eslint-disable-next-line no-await-in-loop
            const { data, meta } = await this.get("wallets", {
                headers: { "Content-Type": "application/json" },
                searchParams,
            });

            next = meta?.next;
            page++;

            voters.push(...data.map((voter: any) => voter.address));
        } while (next);

        return voters;
    }

    public async postTransactions(transactions: any) {
        const { body, statusCode } = await this.post("transactions", {
            headers: { "Content-Type": "application/json" },
            retry: {
                retries: 3,
            },
            body: {
                transactions,
            },
        });

        if (statusCode !== 200 || body.errors) {
            throw new Error(JSON.stringify(body));
        }
    }
}

export default new ApiService();
