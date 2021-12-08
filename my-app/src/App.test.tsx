import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import TestRenderer from 'react-test-renderer';

test('App component renders, Donations Dashboard heading is present', () => {
    const testRenderer = TestRenderer.create(
        <Provider store={store}>
            <App />
        </Provider>
    );

    // @ts-ignore
    expect(testRenderer.toJSON().children[0].children[0].children[0]).toEqual("Donations Dashboard");
});
