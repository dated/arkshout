import { Transactions, Utils } from "@arkecosystem/crypto";

class TransactionService {
    public buildMultiPayment(recipients: string[], config: Record<string, any>) {
        let transaction = Transactions.BuilderFactory.multiPayment()
            .nonce(config.nonce)
            .fee(Utils.BigNumber.make(parseFloat(config.fees.multiPayment) * 1e8).toFixed())
            .vendorField(config.vendorField);

        for (const recipient of recipients) {
            transaction.addPayment(recipient, "1");
        }

        transaction = this.signTransaction(transaction, config.passphrases);

        return transaction.build().toJson();
    }

    public buildTransfer(recipient: string, config: Record<string, any>) {
        let transaction = Transactions.BuilderFactory.transfer()
            .recipientId(recipient)
            .nonce(config.nonce)
            .amount("1")
            .fee(Utils.BigNumber.make(parseFloat(config.fees.transfer) * 1e8).toFixed())
            .vendorField(config.vendorField);

        transaction = this.signTransaction(transaction, config.passphrases);

        return transaction.build().toJson();
    }

    private signTransaction(transaction: any, passphrases: Record<string, string>) {
        transaction = transaction.sign(passphrases.first);

        if (passphrases.second) {
            transaction = transaction.secondSign(passphrases.second);
        }

        return transaction;
    }
}

export default new TransactionService();
