export function generateEditorconfig(stack) {
  const configs = {
    javascript: getJSConfig(),
    typescript: getJSConfig(),
    react: getJSConfig(),
    next: getJSConfig(),
    python: getPythonConfig(),
    fastapi: getPythonConfig(),
    ruby: getRubyConfig(),
    rails: getRubyConfig(),
    lamdera: getElmConfig(),
  };
  
  return configs[stack] || getDefaultConfig();
}

function getDefaultConfig() {
  return `# EditorConfig helps maintain consistent coding styles across different editors
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`;
}

function getJSConfig() {
  return `# EditorConfig helps maintain consistent coding styles across different editors
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[{package.json,*.yml,*.yaml}]
indent_style = space
indent_size = 2

[Makefile]
indent_style = tab
`;
}

function getPythonConfig() {
  return `# EditorConfig helps maintain consistent coding styles across different editors
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.py]
indent_style = space
indent_size = 4
max_line_length = 88

[*.{yml,yaml,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`;
}

function getRubyConfig() {
  return `# EditorConfig helps maintain consistent coding styles across different editors
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{rb,rake}]
indent_style = space
indent_size = 2

[*.{yml,yaml,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`;
}

function getElmConfig() {
  return `# EditorConfig helps maintain consistent coding styles across different editors
# https://editorconfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.elm]
indent_style = space
indent_size = 4

[*.{json,yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`;
}