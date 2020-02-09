import { httpie } from "@arkecosystem/core-utils";
import { Utils } from "@arkecosystem/crypto";
import ConfigService from "../services/config";

class ApiService {
    private async get(url: string, params?: any) {
        const response = await httpie.get(`${ConfigService.get("host")}/${url}`, params);
        return response.body;
    }

    private async post(url: string, withStatus = false, params?: any) {
        const response = await httpie.post(`${ConfigService.get("host")}/${url}`, params);
        return withStatus ? { body: response.body, status: response.status } : response.body;
    }

    public async blockchain() {
        const response = await this.get("blockchain");
        return response.data;
    }

    public async retrieveWallet(id: string) {
        const response = await this.get(`wallets/${id}`);
        return response.data;
    }

    public async retrieveVoters(vote: string, threshold: string) {
        const voters = [];

        let page = 1;
        let next = null;

        do {
            // eslint-disable-next-line no-await-in-loop
            const { data, meta } = await this.post("wallets/search", false, {
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

            next = meta.next;
            page++;

            voters.push(...data.map((voter: any) => voter.address));
        } while (next);

        return voters;
    }

    public async postTransactions(transactions: any) {
        const { status, body } = await this.post("transactions", true, {
            headers: { "Content-Type": "application/json" },
            retry: {
                retries: 3,
            },
            body: {
                transactions,
            },
        });

        if (status !== 200 || body.errors) {
            throw new Error(JSON.stringify(body.errors));
        }
    }
}

export default new ApiService();
