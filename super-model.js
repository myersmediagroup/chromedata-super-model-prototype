
const asset_base = {
  'dbc-1b9860f7-a56b.cloud.databricks.com': 'https://dbc-1b9860f7-a56b.cloud.databricks.com/files/vshih',
}[document.domain] || '.';

const year_min = 1997;
const year_max = 2023;
let makeMap = new Map();
let modelTableColumns = [
  {name: 'supermodel', data: 'supermodel', title: 'super', orderable: false},
  {name: 'model', data: 'model', title: 'model', orderable: false},
];
for (let year = year_min; year <= year_max; ++year) {
  modelTableColumns.push(
    {
      name: year,
      data: year,
      orderable: false,
      title: "'" + year.toString().substr(2),
    }
  );
}
let $modelTable = null;


async function getData() {
  // See https://dbc-1b9860f7-a56b.cloud.databricks.com/?o=5703538034049081#notebook/4118897335225375/command/4118897335225379.
  return fetch(`${asset_base}/super-model-data.json`, {
    mode: 'no-cors',
  })
    .then(response => response.json())
    .then(processData);
}


function processData(data) {
  data.forEach(row => {
    // Pivot years.
    row.years.forEach(year => {
      row[year] = `<div class="green">&nbsp;</div>`;
    });

    for (let year = year_min; year <= year_max; ++year) {
      if (!(year in row)) {
        row[year] = '';
      }
    }

    // TODO supermodel
    row.supermodel = '';

    // Accumulate by make.
    if (!(row.make in makeMap)) {
      makeMap[row.make] = [];
    }

    makeMap[row.make].push(row);
  });
}


function initMakeSelect() {
  $select = $('#make-select');
  Object.keys(makeMap).forEach(make => {
    $select.append(new Option(make, make));
  });

  $select.change(() => {
    const make = $select.find('option:selected').val();
    if (make) {
      initModelTable(make);
    }
  });
}


function initModelTable(make) {
  if ($modelTable){
    $modelTable.destroy();
  }

  $modelTable = $('#model-table').DataTable({
    columns: modelTableColumns,
    data: makeMap[make],
    dom: 't',
    fixedHeader: true,
    order: false,
    paging: false,
    /*
    rowReorder: {
      selector: 'tr',
      snapX: true,
    },
    */
    saveState: true,
    search: {
      smart: false,
    },
  });
}


$(document).ready(async function () {
  await getData();
  initMakeSelect();
});

