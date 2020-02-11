import got from "got";
import { Utils } from "@arkecosystem/crypto";
import ConfigService from "../services/config";
import { IApiResponse, IApiPostResponse } from "../interfaces";

class ApiService {
    private async get(url: string, params?: any) {
        const body: IApiResponse = await got.get(`${ConfigService.get("host")}/${url}`, params).json();
        return body;
    }

    private async post(url: string, params?: any) {
        const response: IApiPostResponse = await got.post(`${ConfigService.get("host")}/${url}`, {
            ...params,
            body: JSON.stringify(params.body),
            responseType: "json",
        });
        return response;
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
            // eslint-disable-next-line no-await-in-loop
            const { body } = await this.post("wallets/search", {
                headers: { "Content-Type": "application/json" },
                query: {
                    page,
                },
                body: {
                    vote,
                    balance: {
                        from: Utils.BigNumber.make(threshold)
                            .times(1e8)
                            .toFixed(),
                    },
                },
            });

            next = body.meta?.next;
            page++;

            voters.push(...body.data.map((voter: any) => voter.address));
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
