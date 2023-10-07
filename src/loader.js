const fs = require('fs');
const path = require('path');

module.exports = (message, d) => {
  d = {};
  d.message = message;

  const filePath = './tests/commands/test.njs';
  const file = fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  const finalCode = parseData(data);
  //console.log(finalCode);
  eval(finalCode.code)
});

  
  const functionsCodes = [
    {
      name: 'log',
      args: [{
        name: 'text',
        description: 'the content of log',
        type: 'any',
        require: true,
      }],
      code: `console.log(text)`
    },
    {
      name: 'slice',
      args: [{
        name: 'text',
        description: 'the text to slice',
        type: 'string',
        require: true
      }, {
        name: 'from',
        type: 'number',
        description: 'the number of slice start from.',
        require: false,
        defaultValue: 0
      }, {
        name: 'to',
        type: 'number',
        description: 'the number of slice end to.',
        require: false,
        defaultValue: 0
      }],
      code: `text.slice(from, to)`
    },
    {
      name: 'createObject',
      args: [{
        name: 'object-name',
        type: 'var',
        description: 'the name of object',
        require: true
      }, {
        name: 'object-data',
        type: 'object',
        description: 'the data of object',
        require: true,
      }],
      code: `const object-name = object-data;`
    },
    {
      name: 'objectHas',
      args: [{
        name: 'object-name',
        type: 'var',
        description: 'the name of object',
        require: true
      }, {
        name: 'property-name',
        type: 'string',
        description: 'the name of property to check',
        require: true
      }],
      code: `object-name.hasOwnProperty(property-name)`
    }, {
      name: 'sendMessage',
      args: [{
        name: 'text',
        type: 'string',
        description: 'Send Text',
        require: true
      }],
      code: `message.channel.send(text)`
    }];
  function parseData(data) {
    const result = {
      config: {},
      code: ''
    };

    let lines = data.trim().split('\n');
    const configSection = lines.shift().trim();

    if (
      configSection.startsWith('(') &&
      configSection.endsWith(')') &&
      configSection.slice(1).startsWith('config')
    ) {
      const configType = configSection.slice(1, -1).split('=')[1];
      result.config['configType'] = configType ?? 'command';

      const codeSectionCheck = lines.filter((e) => e.startsWith('(') && e.endsWith(')') && e.slice(1).startsWith('code'))[0];
      if (!codeSectionCheck) return NeitError('hi', 'hi')
      const codeSectionIndex = lines.indexOf(codeSectionCheck)

      const configData = lines.slice(0, codeSectionIndex);
      let line = 1;

      for (let i = 0; i < configData.length; i++) {
        const property = configData[i];
        let [key, value] = property.split(':');

        if (value === undefined && !property.includes(':')) {
          line = i - line;
          const k = configData[line].split(':')[0];
          const v = result.config[k];
          result.config[k] = `${v}\n${key}`;
        } else {
          line = 1;
          if (value.includes(',')) {
            value = value.split(',').map((e) => e.trim());
          }
          result.config[key] = value;
        }
      }

      const codeData = lines.slice(codeSectionIndex + 1).join('\n');

      function splitAllFunctions(code) {
        let result = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < code.length; i++) {
          if (code[i] === '[') {
            depth++;
          } else if (code[i] === ']') {
            depth--;
          }

          current += code[i];

          if (depth === 0 && current.trim() !== '') {
            result.push(current.trim());
            current = '';
          }
        }

        return result;
      };

      function parseCodeFunction(func) {
        let functionName = func.slice(1, func.indexOf(':'));
        func = func.slice(func.indexOf(':') + 1, -1);

        let funcArgs = func.split(/:(?![^\[\]\(\)\{\}]*[\]\)\}])/);

        funcArgs = funcArgs.map((fa) => {
          if (fa.startsWith('[') && fa.endsWith(']')) {
            return parseCodeFunction(fa);
          } else return fa;
        });

        function parseArg(arg, type) {
          if (type === 'string') return `"${arg}"`;
          else if (type === 'number') return parseInt(arg);
          else if (type === 'array') return `JSON.parse('${arg}')`;
          else if (type === 'object') return `JSON.parse('${arg}')`;
          else if (type === 'stringArray') return JSON.stringify(arg);
          else if (type === 'stringObject') return JSON.stringify(arg);
          else return arg;
        }

        let { args, code } = functionsCodes.find((f) => f.name === functionName);
        args.forEach((argData, index) => {

          const { name, type, require, defaultValue } = argData;
          const arg = funcArgs[index];

          if (require && arg === undefined) {
            if (defaultValue) {
              // default handler
            } else {
              // error handler 
            }
          }

          const parsedArg = parseArg(arg, type);
          const regex = new RegExp(name, 'g');

          code = code.replace(regex, parsedArg);
        });
        return code;
      }

      const codeResult = splitAllFunctions(codeData).map((g) => parseCodeFunction(g)).join('\n');
      const finalData = JSON.stringify(d);
      result.code = `function main(d) { ${codeResult} };main(JSON.parse('${finalData}'));`;
      return result;
    } else {
      return NeitError('Not Found', '"config" not found')
    }
  }
}