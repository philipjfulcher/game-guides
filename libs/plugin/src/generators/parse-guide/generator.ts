import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import {ParseGuideGeneratorSchema} from './schema';
import {createInterface} from "readline";
import {createReadStream} from "fs";
import {join} from "path";


export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  console.log({file: options.file})
  const rl = createInterface({
    input: createReadStream(join(__dirname, options.file)),
  });


  rl.on('line', (line) => {
    console.log(line);
  });

  return new Promise<void>((resolve, reject) => {
    rl.on('close', () => {


      resolve();
    });
  })
}
