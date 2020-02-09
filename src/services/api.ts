import { httpie } from "@arkecosystem/core-utils";
import { Utils } from "@arkecosystem/crypto";
import ConfigService from "../services/config";

class ApiService {
    private async get(url: string, params?: any) {
        const response = await httpie.get(`${ConfigService.get("host")}/${url}`, params);
        return response.body;
    }

    private async post(url: string, params?: any) {
        const response = await httpie.post(`${ConfigService.get("host")}/${url}`, params);
        return response;
    }

    public async blockchain() {
        const body = await this.get("blockchain");
        return body.data;
    }

    public async retrieveWallet(id: string) {
        const body = await this.get(`wallets/${id}`);
        return body.data;
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

            next = body.meta.next;
            page++;

            voters.push(...body.data.map((voter: any) => voter.address));
        } while (next);

        return voters;
    }

    public async postTransactions(transactions: any) {
        const { body, status } = await this.post("transactions", {
            headers: { "Content-Type": "application/json" },
            retry: {
                retries: 3,
            },
            body: {
                transactions,
            },
        });

        if (status !== 200 || body.errors) {
            throw new Error(JSON.stringify(body));
        }
    }
}

export default new ApiService();
