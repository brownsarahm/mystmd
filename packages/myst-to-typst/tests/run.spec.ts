import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { unified } from 'unified';
import type { LatexResult } from '../src';
import mystToTypst from '../src';

type TestCase = {
  title: string;
  typst: string;
  mdast: Record<string, any>;
};

type TestCases = {
  title: string;
  cases: TestCase[];
};

const only = '';

const casesList: TestCases[] = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('.yml'))
  .map((file) => {
    const content = fs.readFileSync(path.join(__dirname, file), { encoding: 'utf-8' });
    return yaml.load(content) as TestCases;
  });

casesList.forEach(({ title, cases }) => {
  const filtered = cases.filter((c) => !only || c.title === only);
  if (filtered.length === 0) return;
  describe(title, () => {
    test.each(filtered.map((c): [string, TestCase] => [c.title, c]))(
      '%s',
      (_, { typst, mdast }) => {
        const pipe = unified().use(mystToTypst);
        pipe.runSync(mdast as any);
        const file = pipe.stringify(mdast as any);
        expect((file.result as LatexResult).value).toEqual(typst);
      },
    );
  });
});
