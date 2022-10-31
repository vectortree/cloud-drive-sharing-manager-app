import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

export default function AnalysisComponent(props) {
    const { data, loading } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 100,
        maxColumns: 10,
    });

    return (
        <>
            <h3>{props.text}</h3>
        <div style={{ height: 600, width: '100%' }}>
            <DataGrid
                {...data}
                loading={loading}
                initialState={{
                    ...data.initialState,
                    filter: {
                        filterModel: {
                            items: [{ columnField: 'quantity', operatorValue: '>', value: 10000 }],
                        },
                    },
                    sorting: {
                        sortModel: [{ field: 'desk', sort: 'asc' }],
                    },
                }}
            />
        </div>
        </>
    );
}
