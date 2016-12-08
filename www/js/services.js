angular.module('starter.services', [])

.factory('Categories', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var categories = [
    {
      id: 1,
      name: 'Beer',
      total_items: 4
    },
    {
      id: 2,
      name: 'Wine',
      total_items: 0
    },
    {
      id: 3,
      name: 'Pizza',
      total_items: 4
    }
  ];

  return {
    all: function() {
      return categories;
    },
    remove: function(catId) {
      categories.splice(categories.indexOf(catId), 1);
    },
    get: function(catId) {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === parseInt(catId)) {
          return categories[i];
        }
      }
      return null;
    }
  };
})

.factory('Items', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var items = [
    {
      id: 1,
      name: 'Heineken',
      image: '',
      price: 2,
      category_id: 1,
      option_groups: [
        {
          name: 'Opt group 1',
          options: [
            {
              id: 1,
              name: '550ml',
              price: 1
            },
            {
              id: 2,
              name: '1000ml',
              price: 2
            }
          ]
        },
        {
          name: 'Opt group 2',
          options: [
            {
              id: 3,
              name: '550ml',
              price: 1
            },
            {
              id: 4,
              name: '1000ml',
              price: 2
            }
          ]
        }
      ],
      total_options: 4
    },
    {
      id: 2,
      name: 'La rue',
      image: '',
      price: 1.95,
      category_id: 1,
      option_groups: [
        {
          name: 'Opt group 1',
          options: [
            {
              id: 1,
              name: '550ml',
              price: 1
            },
            {
              id: 2,
              name: '1000ml',
              price: 2
            }
          ]
        }
      ],
      total_options: 2
    },
    {
      id: 3,
      name: 'Amstel',
      image: '',
      price: 1.8,
      category_id: 1,
      option_groups: [
        {
          name: 'Opt group 1',
          options: [
            {
              id: 1,
              name: '550ml',
              price: 1
            },
            {
              id: 2,
              name: '1000ml',
              price: 2
            }
          ]
        }
      ],
      total_options: 2
    },
    {
      id: 4,
      name: 'Carlsberg',
      image: '',
      price: 2,
      category_id: 1,
      option_groups: [
        {
          name: 'Opt group 1',
          options: [
            {
              id: 1,
              name: '550ml',
              price: 1
            },
            {
              id: 2,
              name: '1000ml',
              price: 2
            }
          ]
        }
      ],
      total_options: 2
    },
    {
      id: 5,
      name: 'Spicy prawn',
      image: '',
      price: 4,
      category_id: 3,
      total_options: 0
    },
    {
      id: 6,
      name: 'Grand supreme',
      image: '',
      price: 5,
      category_id: 3,
      total_options: 0
    },
    {
      id: 7,
      name: 'Loader meatlovers',
      image: '',
      price: 6,
      category_id: 3,
      total_options: 0
    },
    {
      id: 8,
      name: 'Chicken & camembert',
      image: '',
      price: 7,
      category_id: 3,
      total_options: 0
    }
  ];

  return {
    all: function() {
      return items;
    },
    remove: function(itemId) {
      items.splice(items.indexOf(itemId), 1);
    },
    getByCategoryId: function(catId) {
      var returnItems = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].category_id === parseInt(catId)) {
          returnItems.push(items[i]);
        }
      }

      return returnItems;
    },
    get: function(itemId) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === parseInt(itemId)) {
          return items[i];
        }
      }
      return null;
    }
  };
})

.factory('Discounts', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var discounts = [
    {
      id: 1,
      name: 'Base',
      rate: 20,
      amount: null
    },
    {
      id: 2,
      name: 'Base 2',
      rate: null,
      amount: 2
    }
  ];

  return {
    all: function() {
      return discounts;
    },
    remove: function(discountId) {
      discounts.splice(discounts.indexOf(discountId), 1);
    },
    get: function(discountId) {
      for (var i = 0; i < discounts.length; i++) {
        if (discounts[i].id === parseInt(discountId)) {
          return discounts[i];
        }
      }
      return null;
    }
  };
})

.factory('Orders', function($filter) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var orders = [
    {
      id: 1,
      items: [1, 2],
      discount: 10,
      total_items: 2,
      total: 20,
      payment: {
        card: 20,
        cash: 0,
        receipt_number: '312'
      },
      date: '2016-04-23 16:04:00'
    },
    {
      id: 1,
      items: [2, 3],
      discount: 10,
      total_items: 2,
      total: 20,
      payment: {
        card: 20,
        cash: 0,
        receipt_number: '312'
      },
      date: '2016-04-23 16:04:00'
    },
    {
      id: 2,
      items: [1, 2],
      discount: 10,
      total_items: 2,
      total: 20,
      payment: {
        card: 20,
        cash: 0,
        receipt_number: '312'
      },
      date: '2016-04-22 16:04:00'
    },
    {
      id: 3,
      items: [3, 4],
      discount: 10,
      total_items: 2,
      total: 20,
      payment: {
        card: 20,
        cash: 0,
        receipt_number: '312'
      },
      date: '2016-04-22 16:04:00'
    }
  ];

  return {
    all: function() {
      return orders;
    },
    groupByDate: function() {
      var group = {};
      for (var i = 0; i < orders.length; i++) {
        var dateObj = new Date(orders[i].date);
        var date = $filter('date')(dateObj, 'dd-MMMM-yyyy');

        // add time to object
        orders[i].time = $filter('date')(dateObj, 'HH:mm');

        // if this group is defined
        if (angular.isDefined(group[date])) {

          // push order to group
          group[date].push(orders[i]);
        } else {
          // add group
          group[date] = [
            orders[i]
          ]
        }
      }

      return group;
    },
    remove: function(orderId) {
      orders.splice(orders.indexOf(orderId), 1);
    },
    get: function(orderId) {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === parseInt(orderId)) {
          return orders[i];
        }
      }
      return null;
    }
  };
})

.factory('Reports', function($filter) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var report = {
    date: '2016-04-22',
    gross_sale: 1520,
    sales: 4,
    refund: 0,
    discount: 20,
    tax: 10,
    tip: 0,
    cash: 0,
    card: 1530,
    categories: [
      {
        id: 1,
        total: 500
      },
      {
        id: 2,
        total: 1020
      }
    ]
  };

  return {
    all: function () {
      return report;
    }
  }
})
;
