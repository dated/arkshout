import { Transactions, Utils } from "@arkecosystem/crypto";

class TransactionService {
    public buildMultiPayment(recipients: string[], config: Record<string, any>) {
        const payment = Transactions.BuilderFactory.multiPayment()
            .nonce(config.nonce)
            .fee(Utils.BigNumber.make(parseFloat(config.fee) * 1e8).toFixed())
            .vendorField(config.vendorField);

        for (const recipient of recipients) {
            payment.addPayment(recipient, Utils.BigNumber.make(parseFloat(config.amount) * 1e8).toFixed());
        }

        return payment
            .sign(config.passphrase)
            .build()
            .toJson();
    }

    public buildTransfer(recipient: string, config: Record<string, any>) {
        return Transactions.BuilderFactory.transfer()
            .recipientId(recipient)
            .nonce(config.nonce)
            .amount(Utils.BigNumber.make(parseFloat(config.amount) * 1e8).toFixed())
            .fee(Utils.BigNumber.make(parseFloat(config.fee) * 1e8).toFixed())
            .vendorField(config.vendorField)
            .sign(config.passphrase)
            .build()
            .toJson();
    }
}

export default new TransactionService();
