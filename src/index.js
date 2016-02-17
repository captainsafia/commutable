import Immutable from 'immutable';

import { cleanMultilineNotebook } from './cleaning';
import { v4 as uuid } from 'node-uuid';

export function fromJS(notebookJS) {
  const immnb = cleanMultilineNotebook(Immutable.fromJS(notebookJS));

  const cellData = {};
  return immnb
    .set('cellOrder', immnb.get('cells').map(cell => {
      const id = uuid();
      cellData[id] = cell;
      return id;
    }))
    .remove('cells')
    .set('cellMap', Immutable.fromJS(cellData));
}

export function toJS(notebook) {
  return notebook
    .set('cells', notebook
      .get('cellOrder', new Immutable.List())
      .map(id =>
        notebook.getIn(['cellMap', id], Immutable.fromJS({}))
      )
    )
    .remove('cellOrder')
    .remove('cellMap')
    .toJS();
}

/**
 * Create a new Notebook
 * @param {language_info} language_info the language info for the document
 * @param {language_info.file_extension} the file extension for the language
 * @param {language_info.mimetype} the mimetype for the language
 * @param {language_info.name} nice name of the language
 * @param {language_info.version} version of the language
 */
export function Notebook(language_info) {
  return fromJS({
    'cells': [],
    'nbformat': 4,
    'nbformat_minor': 0,
    language_info,
  });
}

export const emptyMarkdownCell = Immutable.fromJS({
  'cell_type': 'markdown',
  'metadata': {},
  'source': '',
});

export const emptyCodeCell = Immutable.fromJS({
  'cell_type': 'code',
  'execution_count': null,
  'metadata': {
    'collapsed': false,
  },
  'source': '',
  'outputs': [],
});

export function insertCellAt(notebook, cell, index) {
  const cellID = uuid();
  return notebook.setIn(['cellMap', cellID], cell)
                 .set('cellOrder',
                  notebook.get('cellOrder').splice(index, 0, cellID));
}

export function appendCell(notebook, cell) {
  const cellID = uuid();
  return notebook.setIn(['cellMap', cellID], cell)
                 .set('cellOrder',
                  notebook.get('cellOrder').push(cellID));
}
