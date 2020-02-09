# ARKShout

> Keep in touch with your voters.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
yarn global add @dated/arkshout
```

## `arkshout config`

Update the configuration

```
USAGE
  $ arkshout config
```

## `arkshout config:network`

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

## `arkshout config:delegate`

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

## `arkshout config:transactions`

Configure your transactions

```
...
```

## `arkshout message`

Send a message to your voters

```
USAGE
  $ arkshout message

OPTIONS
  --amount=amount             The amount used for each transaction
  --fee=fee                   The fee used for each transaction
  --minVote=minVote           The minimum vote weight of your voters
  --multiPayment=multiPayment Use multi payments over regular transfers
  --vendorField=vendorField   The message you want to send to each voter
```

## Credits

-   [All Contributors](../../contributors)

## License

[MIT](LICENSE) © [Edgar Goetzendorff](https://dated.fun)
