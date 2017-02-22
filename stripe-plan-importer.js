'use strict';

const vorpal = require('vorpal')();
const config = require('./env');
const stripe = require('stripe')(
  config.OLD_ACCOUNT_STRIPE_API_KEY
);
const BPromise = require('bluebird');
const plans = BPromise.promisifyAll(stripe.plans);
const coupons = BPromise.promisifyAll(stripe.coupons);

vorpal
  .command('import-plans', 'Import stripe plans from old to new account.')
  .action(args => {
    let createPlansRequest

    vorpal.log('retrieve the plans from the old account');
    return plans.listAsync()
      .then(result => {
        return BPromise.map(result.data, plan => {
          delete plan.object;
          delete plan.created;
          delete plan.livemode;

          return plans.createAsync(plan, {
            api_key: config.NEW_ACCOUNT_STRIPE_API_KEY
          });
        });
      })
      .then(() => {
        vorpal.log('importing the plans to the new account');
        return null;
      })
      .catch(err => vorpal.log('Failed to import the plans.', err.message));
  });

vorpal
  .command('import-coupons', 'Import stripe coupons from old to new account.')
  .action(args => {
    vorpal.log('retrieve the coupons from the old account');

    return coupons.listAsync()
      .then(result => {
        return BPromise.map(result.data, coupon => {
          let newCoupon = {
            id: coupon.id,
            currency: coupon.currency,
            duration: coupon.duration,
            amount_off: coupon.amount_off
          };
          return coupons.createAsync(newCoupon, {
            api_key: config.NEW_ACCOUNT_STRIPE_API_KEY
          });
        });
      })
      .then(() => vorpal.log('importing the coupons to the new account'))
      .catch(err => vorpal.log('Failed to import the coupons.', err.message));
  });

vorpal
  .command('create-coupons', 'Create stripe coupons from a JSON file.')
  .action(args => {
    vorpal.log('creating the coupons...');
    let newCoupons = require('./coupons');
    let createCouponsRequest = [];

    for (let i = 0; i < newCoupons.length; i++) {
      createCouponsRequest.push(coupons.createAsync(newCoupons[i]));
    }

    return BPromise.all(createCouponsRequest)
      .then(() => vorpal.log('done!'))
      .catch(err => vorpal.log('Failed to create the coupons.', err.message));
  });

vorpal
  .command('create-plans', 'Create stripe plans from a JSON file.')
  .action(args => {
    vorpal.log('creating the plans...');
    let newPlans = require('./plans');
    let createPlansRequest = [];

    for (let i = 0; i < newPlans.length; i++) {
      createPlansRequest.push(plans.createAsync(newPlans[i]), {
        api_key: config.NEW_ACCOUNT_STRIPE_API_KEY
      });
    }

    return BPromise.all(createPlansRequest)
      .then(() => vorpal.log('done!'))
      .catch(err => vorpal.log('Failed to create the plans.', err.message));
  });

vorpal
  .delimiter('stripe-plan-importer$')
  .show();
