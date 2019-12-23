## Getting started

To run the app clone project and then use:

```
$ npm start
```
(after npm i)
```
$ npm run devstart (for development use)
```
## API description

- /signin [POST]
  reguest params {
    login: string,
    password: string
  }

  response {
    accessToken: string,
    refreshToken: string,
    login: string,
    password: string
  }

- /signin/refresh_token [GET] - update access token using refresh token
  reguest params {
    refreshToken: string
  }
  response {
    accessToken: string,
    refreshToken: string,
  }
- /signup [POST] - create new user
  reguest params {
    login: string,
    password: string
  }

  response {
    accessToken: string,
    refreshToken: string,
    login: string,
    password: string
  }
- /logout [GET] - deactivate current token an get the new one
  response {
    accessToken: string,
    refreshToken: string,
  }
- /file/upload [POST] - upload new file and save it to server
  reguest params {
    file: form-data
  }
  response {
    accessToken: string,
    refreshToken: string,
    login: string,
    password: string
  }
- /file/list [GET] - the list of uploaded files
pagination params {
  page: integer - the page to show,
  listSize: integer - the number of files per page
}

response {
  data: array
}

- /file/delete/:id [DELETE] - delete uploaded file by id

- /file/:id [GET] - get file's info by id
  response {
    name: string,
    mimetype: string,
    size: real,
    extension: string,
  }
- /file/download/:id [GET] - download file by id

- /file/update/:id [PUT] - updtae file by id
  reguest params {
    file: form-data
  }

  response {
    name: string,
    mimetype: string,
    size: real,
    extension: string,
  }
- /info [GET] - get current user id
