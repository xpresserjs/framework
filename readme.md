# Xpresser Js (Beta)

![Alt text](https://cdn.jsdelivr.net/npm/xpresser/xpresser-logo-black.png "Xpresser Logo")

A powerful framework for nodejs, Using `expressjs` as a server and also other community proven worthy libraries.


### What you get
1. Complete MVC structure
2. User Authentication
3. Nested Routing
4. Named Routes
5. A tinker (beta)
6. Webpack ready using `laravel-mix`
7. All database supported by `KnexJs` e.g **Postgres**, **MSSQL**, **MySQL**, **MariaDB**, **SQLite3**, **Oracle**, and **Amazon Redshift**
8. Custom console commands
9. _So much more!!!_

### Installation
Installing Xpresser Framework requires [**Xpresser CLI**](https://www.npmjs.com/package/xjs-cli)

The `xjs-cli` command includes all the helpers you need.

#### Install Xpresser-CLI
```console
npm install xjs-cli -g
```

This installs `xjs-cli` globally so you can use the `xjs` command.

Run `xjs --help` after installation.

#### Create New Project
```console
xjs new my-xjs-app
```
Create your sqlite file in `storage/app/db/database.sqlite`
After that, you will be told to run `xjs migrate`  to migrate your database.
```
Using environment: development
Batch 1 run: 1 migrations 
20190208064039_create_user_table.js
```
We have just migrated our user database.

That's all! 
We are now ready to **start our App.**
```
xjs start
```

#### Hurray!
```
===>  Starting Xpresser...
===>  Server started and available on http://localhost:2000/
===>  PORT:2000
```


### More Commands?
```console
xjs --help
```

## XJS STATUS
Used in over **15 Projects** and works **perfectly fine.**

If you use xjs, please let us know how it has served you.
