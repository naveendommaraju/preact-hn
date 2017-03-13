'use strict';

const fs = require('fs');
const path = require('path');
const ListData = require('../../storage/lists.js');
const ItemsData = require('../../storage/items.js');

function apiNewRoute(req, res, next) {
  res.setHeader('content-type', 'application/json; charset=utf-8');

  const latestUUID = ListData.uuid('new');
  const latestNewItems = ListData.latest('new').slice(0,20);

  res.send({
    'uuid': latestUUID,
    'from': 0,
    'to': 20,
    'items': latestNewItems,
    '$entities': latestNewItems.reduce(function(acc, cur, index) {
      const item = ItemsData.get(cur, req.log);
      acc[item.id] = item;
      return acc;
    }, {})
  });

  next();
}

module.exports = apiNewRoute;