# ARKShout

> Keep in touch with your voters.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
yarn global add @dated/arkshout
```

## Usage

### `arkshout config`

Update the configuration

```
USAGE
  $ arkshout config
```

### `arkshout config:network`

Configure the network

```
USAGE
  $ arkshout config:network

OPTIONS
  --network=network   [mainnet | devnet] The name of the network that should be used
  --host=host         The host used to interact with the blockchain

EXAMPLES
  Configure the network
  $ arkshout config:network --network=devnet --host=https://dexplorer.ark.io/api
```

### `arkshout config:delegate`

Configure your delegate

```
USAGE
  $ arkshout config:delegate

OPTIONS
  --publicKey=publicKey  The public key of your delegate
  --username=username    The username of your delegate

EXAMPLES
  Configure your delegate using your username
  $ arkshout config:delegate --username=dated

  Configure your delegate using your public key
  $ arkshout config:delegate --publicKey=02cb93172a19a66e236baedb382b3c9013ddd4238c89e6eb739d20b362010c00c1
```

### `arkshout config:fees`

Configure the fees used for your transactions

```
USAGE
  $ arkshout config:fees

OPTIONS
  --transfer=transfer         The fee used for regular transfers
  --multiPayment=multiPayment The fee used for multi payments

EXAMPLES
  Configure the fee used for regular transfer
  $ arkshout config:fees --transfer=0.0001

  Configure the fee used for multi payments
  $ arkshout config:fees --multiPayment=0.01
```

### `arkshout config:passphrase`

Configure the passphrase(s) used to send your transactions

```
USAGE
  $ arkshout config:passphrase

OPTIONS
  --first=passphrase Your passphrase
  --first=passphrase Your second passphrase

EXAMPLES
  Configure the first passphrase
  $ arkshout config:passphrase --first="my first passphrase"

  Configure the second passphrase
  $ arkshout config:passphrase --second="my second passphrase"
```

### `arkshout message`

Send a message to your voters

```
USAGE
  $ arkshout message

OPTIONS
  --vendorField=vendorField   The message you want to send to each voter
  --no-multi                  Send regular transfer instead of multi payments
```

## Credits

-   [All Contributors](../../contributors)

## License

[MIT](LICENSE) © [Edgar Goetzendorff](https://dated.fun)
