let routes = {
  account : {
    list: {
      method: 'GET',
      path: '/v2/account',
    },
  },
  actions : {
    list: {
      method: 'GET',
      path: '/v2/actions',
    },
    get: {
      method: 'GET',
      path: '/v2/actions/$KEY',
    },
  },
  apps : {
    list: {
      method: 'GET',
      path: '/v2/apps/$KEY',
    },
    create: {
      method: 'POST',
      path: '/v2/apps',
    },
    update: {
      method: 'PUT',
      path: '/v2/apps/$KEY',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/apps/$KEY',
    },
    detect: {
      method: 'POST',
      path: '/v2/apps/detect',
    },
    deployments: {
      list: {
        method: 'GET',
        path: '/v2/apps/$KEY/deployments',
      },
      get: {
        method: 'GET',
        path: '/v2/apps/$KEY/deployments/$KEY',
      },
      create: {
        method: 'POST',
        path: '/v2/apps/$KEY/deployments',
      },
      find: {
        method: 'POST',
        path: '/v2/apps/$KEY/deployments/$KEY/cancel',
      },
    }
  },
  balance : {},
  billing : {},
  volumes : {
    list: {
      method: 'GET',
      path: '/v2/volumes',
    },
    get: {
      method: 'GET',
      path: '/v2/volumes/$KEY',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/volumes/$KEY',
    },
    delete_by_name: {
      method: 'DELETE',
      path: '/v2/volumes',
    },
    snapshots: {
      list: {
        method: 'GET',
        path: '/v2/volumes/$KEY/snapshots',
      },
      create: {
        method: 'POST',
        path: '/v2/volumes/$KEY/snapshots',
      },
      delete: {
        method: 'DELETE',
        path: '/v2/snapshots/$KEY',
      },
    },
  },
  cdn : {},
  certificates : {},
  containers : {},
  databases : {},
  domains : {
    list: {
      method: 'GET',
      path: '/v2/domains',
    },
    get: {
      method: 'GET',
      path: '/v2/domains/$KEY',
    },
    create: {
      method: 'POST',
      path: '/v2/domains',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/domains/$KEY',
    },
    records: {
      list: {
        method: 'GET',
        path: '/v2/domains/$KEY/records',
      },
      get: {
        method: 'GET',
        path: '/v2/domains/$KEY/records/$KEY',
      },
      create: {
        method: 'POST',
        path: '/v2/domains/$KEY/records',
      },
      update: {
        method: 'PUT',
        path: '/v2/domains/$KEY/records/$KEY',
      },
      delete: {
        method: 'DELETE',
        path: '/v2/domains/$KEY/records/$KEY',
      },
    },
  },
  droplets : {
    list: {
      method: 'GET',
      path: '/v2/droplets',
    },
    get: {
      method: 'GET',
      path: '/v2/droplets/$KEY',
    },
    create: {
      method: 'POST',
      path: '/v2/droplets',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/droplets/$KEY',
    },
    actions: {
      method: 'GET',
      path: '/v2/droplets/$KEY/actions',
    },
    snapshots: {
      method: 'GET',
      path: '/v2/droplets/$KEY/snapshots',
    },
    neighbors: {
      method: 'GET',
      path: '/v2/droplets/$KEY/neighbors',
    }
  },
  floating_ips : {},
  firewalls : {},
  images : {},
  invoices : {},
  kubernetes : {},
  load_balancers : {},
  projects : {},
  regions : {},
  sizes : {},
  snapshots : {},
  keys : {
    list: {
      method: 'GET',
      path: '/v2/account/keys',
    },
    get: {
      method: 'GET',
      path: '/v2/account/keys/$KEY',
    },
    update: {
      method: 'POST',
      path: '/v2/account/keys',
    },
    update: {
      method: 'PUT',
      path: '/v2/account/keys/$KEY',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/account/keys/$KEY',
    },
  },
  tags : {},
  vpcs : {
    list: {
      method: 'GET',
      path: '/v2/vpcs',
    },
    find: {
      method: 'GET',
      path: '/v2/vpcs/$KEY',
    },
    create: {
      method: 'POST',
      path: '/v2/vpcs',
    },
    update: {
      method: 'PATCH',
      path: '/v2/vpcs/$KEY',
    },
    members: {
      method: 'GET',
      path: '/v2/vpcs/$KEY/members',
    },
    delete: {
      method: 'DELETE',
      path: '/v2/vpcs/$KEY',
    },
  },
}

function get_route_info(dot_path){ // example dot_path = 'droplets.list'
  let parts = dot_path.split('.')
  let val = routes
  for (let i = 0; i < parts.length; i++) {
    try {
      val = val[parts[i]]
    } catch (error) {
      return null
    }
  }
  return val
}

module.exports = get_route_info
