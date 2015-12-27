# maya.js [![Build Status](https://travis-ci.org/Ragg-/maya.js.svg?branch=travis)](https://travis-ci.org/Ragg-/maya.js)

```
Is the order a better framework?
```

Web application framework for Node.js

## Concept
- Developer's `Try-Catch-Try` iteration assistance.  
  maya.js supporting `Save on Reload` for `static assets` and `Controller`, `View`, `Model`.

- DRY for code  
  Build system builtin, maya.js uses `Fly`, `Webpack`, `Stylus` as it default.  
  And setting up to be able to `require` View, Logic from Browser-side javascript,

- Realtime Web  
  maya.js build in supports for socket.io.

- MVC + Logic (**Experimental researchinhg**)  
  maya.js is made as a basic MVC framework.  
  But maya.js is separates `Logic` from Model.  
  It's thought to be able to use Logic in Browser, and it may removes db connections from tests and makes those tests to be more simpler.

# Install
```
npm install -g maya
```

## Initialize Project
```
cd path/to/your/project
maya init
```

## Run
```
maya cqc
```

# License
maya.js licensed under `MIT License`.  
See [LICENSE](https://github.com/Ragg-/maya.js/blob/master/LICENSE).
