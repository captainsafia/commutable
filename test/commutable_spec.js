import { expect } from 'chai';

import { fromJS, toJS, Notebook } from '../src';
import { readJSON } from './notebook_helpers';
import { valid } from 'notebook-test-data';

import path from 'path';

describe('fromJS', () => {
  it('reads a notebook from disk, converting multi-line strings', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = fromJS(notebook);

        expect(nb).to.not.be.null;

        const cellOrder = nb.get('cellOrder');
        cellOrder.forEach(id => {
          const cell = nb.getIn(['cellMap', id]);
          // Converted
          expect(cell.get('source')).to.be.a('string');

          if (cell.contains('outputs')) {
            cell.outputs.filter(o => o.output_type === 'stream')
                        .forEach(o => {
                          expect(o.text).to.be.a('string');
                        });
            cell.outputs.filter(o => o.data)
                        .map(o => o.data)
                        .forEach(mimebundle => {
                          expect(mimebundle).to.be.a('string');
                        });
          }

        });
      });
  });
});

describe('toJS', () => {
  it('returns something', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb).to.not.be.null;
      });
  });
  it('removes cellMap', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb.cellMap).to.be.undefined;
      });
  });
  it('removes cellOrder', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb.cellOrder).to.be.undefined;
      });
  });
  it('creates cells', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const inMem = fromJS(notebook);
        const nb = toJS(inMem);
        expect(nb.cells).to.not.be.undefined;
        expect(nb.cells.length).to.equal(inMem.get('cellOrder').count());
      });
  });
});

describe('Notebook', () => {
  it('creates an empty notebook', () => {
    const languageInfo = {
      'file_extension': '.js',
      'mimetype': 'application/javascript',
      'name': 'javascript',
      'version': '5.5.0',
    };
    const nb = new Notebook(languageInfo);
    expect(nb.get('cellOrder').size).to.equal(0);
    expect(nb.get('cellMap').size).to.equal(0);
    expect(nb.getIn(['language_info', 'file_extension'])).to.equal('.js');
  });
});
