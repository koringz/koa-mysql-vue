module.exports = {
    root: true,
    env: {
      'node': true
    },
    parserOptions: {
      "parser": "babel-eslint"
    },
    extends: [
      // add more generic rulesets here, such as:
      // 'eslint:recommended',
      "plugin:vue/essential",
      "eslint:recommended"
    ],
    rules: {
        // override/add rules settings here, such as:
        // 'vue/no-unused-vars': 'error'
        // 不禁止console
        'no-debugger': 0,
        // 禁止出现未使用的变量
        "no-console": "off",
        "no-unused-vars": 'off',
        "no-undef": "off"
    }
  }