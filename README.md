Stripe Plans Importer
====================

# How to use

## Config

Configure the Stripe API keys for both old and new account. Open `env.sample.js` and save it as `env.js`

Notes:
* You can get your API keys in the [Stripe Dashboard](https://dashboard.stripe.com/account/apikeys).

## Import

Run the `stripe-plan-importer.js` file:

```sh
$ node stripe-plan-importer.js
```

```sh
# the prompt will be changed
stripe-plan-importer$
# now execute import
stripe-plan-importer$ import
```

# License

Licensed under the MIT License
