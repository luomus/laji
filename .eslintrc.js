module.exports = {
  "root": true,
  "ignorePatterns": [
    "projects/laji/src/test.ts",
		"projects/laji-api-client-b/generated/*"
  ],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parserOptions": {
        "tsconfigRootDir": __dirname,
        "project": [
          "tsconfig.json",
          "projects/laji/e2e/tsconfig.e2e.json"
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/template/process-inline-templates"
			],
			"plugins": [
				"@typescript-eslint",
				"@angular-eslint",
				"eslint-plugin-rxjs",
				"eslint-plugin-import",
				"eslint-plugin-jsdoc",
				"eslint-plugin-prefer-arrow"
			],
			"rules": {
				"@typescript-eslint/interface-name-prefix": "off",
				"sort-keys": "off",
				"@angular-eslint/component-class-suffix": "error",
				"@angular-eslint/contextual-lifecycle": "error",
				"@angular-eslint/directive-class-suffix": "error",
				"@angular-eslint/no-conflicting-lifecycle": "error",
				"@angular-eslint/no-host-metadata-property": "error",
				"@angular-eslint/no-input-rename": "error",
				"@angular-eslint/no-inputs-metadata-property": "error",
				"@angular-eslint/no-output-native": "error",
				"@angular-eslint/no-output-on-prefix": "error",
				"@angular-eslint/no-output-rename": "error",
				"@angular-eslint/no-outputs-metadata-property": "error",
				"@angular-eslint/use-lifecycle-interface": "error",
				"@angular-eslint/use-pipe-transform-interface": "error",
				"@typescript-eslint/adjacent-overload-signatures": "error",
				"@typescript-eslint/array-type": "off",
				"@typescript-eslint/ban-types": [
					"error",
					{
						"types": {
							"Object": {
								"message": "Avoid using the `Object` type. Did you mean `object`?"
							},
							"Function": {
								"message": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
							},
							"Boolean": {
								"message": "Avoid using the `Boolean` type. Did you mean `boolean`?"
							},
							"Number": {
								"message": "Avoid using the `Number` type. Did you mean `number`?"
							},
							"String": {
								"message": "Avoid using the `String` type. Did you mean `string`?"
							},
							"Symbol": {
								"message": "Avoid using the `Symbol` type. Did you mean `symbol`?"
							}
						}
					}
				],
				"@typescript-eslint/no-empty-function": "off",
				"@typescript-eslint/no-empty-interface": "error",
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-inferrable-types": [
					"error",
					{
						"ignoreParameters": true
					}
				],
				"@typescript-eslint/no-misused-new": "error",
				"@typescript-eslint/no-parameter-properties": "off",
				"@typescript-eslint/no-use-before-define": "off",
				"@typescript-eslint/no-var-requires": "off",
				"@typescript-eslint/prefer-for-of": "error",
				"@typescript-eslint/prefer-function-type": "error",
				"@typescript-eslint/prefer-namespace-keyword": "error",
				"@typescript-eslint/triple-slash-reference": [
					"error",
					{
						"path": "always",
						"types": "prefer-import",
						"lib": "always"
					}
				],
				"@typescript-eslint/unified-signatures": "error",
				"complexity": "off",
				"constructor-super": "error",
				"eqeqeq": ["error", "smart"],
				"guard-for-in": "error",
				"import/no-deprecated": "warn",
				"jsdoc/no-types": "error",
				"no-bitwise": "error",
				"no-caller": "error",
				"no-cond-assign": "error",
				"no-console": [
					"error",
					{
						"allow": [
							"log",
							"warn",
							"dir",
							"timeLog",
							"assert",
							"clear",
							"count",
							"countReset",
							"group",
							"groupEnd",
							"table",
							"dirxml",
							"error",
							"groupCollapsed",
							"Console",
							"profile",
							"profileEnd",
							"timeStamp",
							"context"
				]
					}
				],
				"no-debugger": "error",
				"no-empty": "off",
				"no-eval": "error",
				"no-fallthrough": "error",
				"no-invalid-this": "off",
				"no-new-wrappers": "error",
				"no-restricted-imports": [
					"error",
					{
						"name": "rxjs/Rx",
						"message": "Please import directly from 'rxjs' instead"
					}
				],
				"@typescript-eslint/no-shadow": [
					"error",
					{
						"hoist": "all"
					}
				],
				"no-throw-literal": "error",
				"no-undef-init": "error",
				"no-unsafe-finally": "error",
				"no-unused-labels": "error",
				"no-var": "error",
				"object-shorthand": "error",
				"prefer-const": "error",
				"radix": "error",
				"use-isnan": "error",
				"valid-typeof": "off",
				"arrow-body-style": "error",
				"arrow-parens": "off",
				"comma-dangle": "off",
				"curly": "error",
				"eol-last": "error",
				"jsdoc/check-alignment": "error",
				"new-parens": "error",
				"no-multiple-empty-lines": "off",
				"no-trailing-spaces": "error",
				"quote-props": ["error", "as-needed"],
				"space-before-function-paren": [
					"error",
					{
						"anonymous": "never",
						"asyncArrow": "always",
						"named": "never"
					}
				],
				"@typescript-eslint/member-delimiter-style": [
					"error",
					{
						"multiline": {
							"delimiter": "semi",
							"requireLast": true
						},
						"singleline": {
							"delimiter": "semi",
							"requireLast": false
						}
					}
				],
				"quotes": "off",
				"@typescript-eslint/quotes": [
					"error",
					"single",
					{ "allowTemplateLiterals": true }
				],
				"@typescript-eslint/semi": ["error", "always"],
				"@typescript-eslint/type-annotation-spacing": "error",
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": [
              "laji"
            ],
            "style": "kebab-case"
          }
        ],
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": [
              "laji"
            ],
            "style": "camelCase"
          }
        ],
        "@angular-eslint/use-component-view-encapsulation": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/explicit-member-accessibility": [
          "off",
          {
            "accessibility": "explicit"
          }
        ],
        "brace-style": [
          "error",
          "1tbs",
          {
            "allowSingleLine": true
          }
        ],
        "id-blacklist": "off",
        "id-match": "off",
        "max-classes-per-file": [
          "error",
          1
        ],
        "max-len": [
          "error",
          {
            "code": 170
          }
        ],
        "no-underscore-dangle": "off",
        "rxjs/no-internal": "error",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "default",
            "format": [
              "camelCase"
            ],
            "leadingUnderscore": "allow",
            "trailingUnderscore": "allow"
          },
          {
            "selector": "variable",
            "format": [
              "camelCase",
              "UPPER_CASE"
            ],
            "leadingUnderscore": "allow",
            "trailingUnderscore": "allow"
          },
          {
            "selector": "typeLike",
            "format": [
              "PascalCase"
            ]
          },
          {
            "selector": "objectLiteralProperty",
            "format": null
          },
          {
            "selector": "classProperty",
            "format": [
              "camelCase",
              "UPPER_CASE"
            ],
            "leadingUnderscore": "allow"
          },
          {
            "selector": "classMethod",
            "format": [
              "camelCase",
              "PascalCase"
            ],
            "leadingUnderscore": "allow"
          },
          {
            "selector": "enumMember",
            "format": [
              "camelCase",
              "PascalCase"
            ]
          },
          {
            "selector": "typeProperty",
            "format": null
          }
        ],
        "jsdoc/newline-after-description": "off",
        "@typescript-eslint/no-namespace": "off",
        "one-var": "off",
        "@typescript-eslint/consistent-type-assertions": "off",
        "@typescript-eslint/member-ordering": "off",
        "prefer-arrow/prefer-arrow-functions": "off",
        "@typescript-eslint/no-unused-expressions": [
          "error",
          {
            "allowTernary": true
          }
        ]
      }
    },
    {
      "files": [
        "*.html"
      ],
      "extends": [
        "plugin:@angular-eslint/template/recommended"
      ],
      "rules": {
        "@angular-eslint/template/eqeqeq": "off",
        "@angular-eslint/template/no-negated-async": "off"
      }
    }
  ]
}
