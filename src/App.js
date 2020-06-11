import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import React from 'react'
import styles from './App.module.css'

import { Sidebar } from './sidebar'
import {
    GATEWAY_CONFIG_FORM_EDIT_PATH,
    GATEWAY_CONFIG_FORM_NEW_PATH,
    GATEWAY_CONFIG_LIST_PATH,
    GatewayConfigFormEdit,
    GatewayConfigFormNew,
    GatewayConfigList,
    HOME_PATH,
    Home,
    NoMatch,
} from './views'

console.log('GATEWAY_CONFIG_LIST_PATH', GATEWAY_CONFIG_LIST_PATH)
console.log('GatewayConfigList', GatewayConfigList)

const App = () => (
    <BrowserRouter>
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <Sidebar />
            </div>

            <main className={styles.content}>
                <Switch>
                    <Route exact path={HOME_PATH} component={Home} />

                    <Route
                        exact
                        path={GATEWAY_CONFIG_FORM_EDIT_PATH}
                        component={GatewayConfigFormEdit}
                    />

                    <Route
                        exact
                        path={GATEWAY_CONFIG_FORM_NEW_PATH}
                        component={GatewayConfigFormNew}
                    />

                    <Route
                        exact
                        path={GATEWAY_CONFIG_LIST_PATH}
                        component={GatewayConfigList}
                    />

                    <Redirect
                        from="/sms-gateway"
                        to={GATEWAY_CONFIG_LIST_PATH}
                    />

                    <Route component={NoMatch} />
                </Switch>
            </main>
        </div>
    </BrowserRouter>
)

export default App
