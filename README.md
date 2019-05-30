# request-promise-errors-util-inspect

Patches request-promise-core errors to not include sensitive information during logging in NodeJS.

# Installation

`npm i --save request-promise-errors-util-inspect`

In your main file

```
require('request-promise-errors-util-inspect');
```

# More logging

If you need to log the response, set the environment variable `LOG_LEVEL` to `debug`

# How it works

`request-promise-core/errors` exports 3 classes,

- RequestError
- StatusCodeError
- TransformError

Doing a console.log of these errors will print the whole response object, exposing sensitive informations and/or bloating the console with unuseful informations.

When required, this package monkey patches these classes to introduce two new functions (`[util.inspect.custom]` and `toJSON`) to pretty print and serialize the errors.

# License

MIT
