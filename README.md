## Getting started

To run the app clone project and then use:
```
$ npm install
```
```
$ npm start 
```
```
$ npm run devstart (for development use)
```
## API description

- /auth/signin [POST]
```
  reguest params {
    id: string,
    password: string
  }
```
```
  response {
    accessToken: string,
    refreshToken: string,
    id: string,
    password: string
  }
```

- /auth/signin/refresh_token [GET] - update access token using refresh token

```
  response {
    accessToken: string,
    refreshToken: string,
  }
```

- /auth/signup [POST] - create new user
```
  reguest params {
    id: string,
    password: string
  }
```
```
  response {
    accessToken: string,
    refreshToken: string,
    id: string,
    password: string,
    updatedAt: string,
    createdAt: string
  }
```
- /auth/logout [GET] - deactivate current token an get the new one
```
  response {
    accessToken: string,
    refreshToken: string,
  }
```
- /file/upload [POST] - upload new file and save it to server
```
  reguest params {
    filedata: form-data
  }
```
```
  response {
    id: string,
    name: string,
    mimeType: string,
    size: real,
    extension: string,
    updatedAt: string,
    createdAt: string
  }
```

- /file/list [GET] - the list of uploaded files
```
pagination params {
  page: integer - the page to show (default 1),
  listSize: integer - the number of files per page (default 10)
}
```
```
response {
  data: array,
  count: integer
}
```

- /file/delete/:id [DELETE] - delete uploaded file by id

- /file/:id [GET] - get file's info by id
```
  response {
    id: string,
    name: string,
    mimeType: string,
    size: real,
    extension: string,
    updatedAt: string,
    createdAt: string
  }
```
- /file/download/:id [GET] - download file by id

- /file/update/:id [PUT] - updtae file by id
```
  reguest params {
    filedata: form-data
  }
```
```
  response {
    id: string,
    name: string,
    mimeType: string,
    size: real,
    extension: string,
    updatedAt: string,
    createdAt: string
  }
```
- /users/info [GET] - get current user id
```
  response {
    currentUser: string
  }
```
