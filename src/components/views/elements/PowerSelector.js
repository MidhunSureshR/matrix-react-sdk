/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

import React from 'react';
import * as Roles from '../../../Roles';
import { _t } from '../../../languageHandler';

module.exports = React.createClass({
    displayName: 'PowerSelector',

    propTypes: {
        value: React.PropTypes.number.isRequired,

        // if true, the <select/> should be a 'controlled' form element and updated by React
        // to reflect the current value, rather than left freeform.
        // MemberInfo uses controlled; RoomSettings uses non-controlled.
        //
        // ignored if disabled is truthy. false by default.
        controlled: React.PropTypes.bool,

        // should the user be able to change the value? false by default.
        disabled: React.PropTypes.bool,
        onChange: React.PropTypes.func,
    },

    getInitialState: function() {
        return {
            levelRoleMap: {},
        };
    },

    componentWillMount: function() {
        // This needs to be done now because levelRoleMap has translated strings
        const levelRoleMap = Roles.levelRoleMap();
        this.setState({
            levelRoleMap,
            custom: levelRoleMap[this.props.value] === undefined,
        });
    },

    onSelectChange: function(event) {
        this.setState({ custom: event.target.value === "SELECT_VALUE_CUSTOM" });
        if (event.target.value !== "SELECT_VALUE_CUSTOM") {
            this.props.onChange(this.getValue());
        }
    },

    onCustomBlur: function(event) {
        this.props.onChange(this.getValue());
    },

    onCustomKeyDown: function(event) {
        if (event.key == "Enter") {
            this.props.onChange(this.getValue());
        }
    },

    getValue: function() {
        let value;
        if (this.refs.select) {
            value = this.refs.select.value;
            if (this.refs.custom) {
                if (value === undefined) value = parseInt( this.refs.custom.value );
            }
        }
        return value;
    },

    render: function() {
        let customPicker;
        if (this.state.custom) {
            let input;
            if (this.props.disabled) {
                input = <span>{ this.props.value }</span>;
            } else {
                input = <input ref="custom" type="text" size="3" defaultValue={this.props.value} onBlur={this.onCustomBlur} onKeyDown={this.onCustomKeyDown} />;
            }
            customPicker = <span> of { input }</span>;
        }

        let selectValue;
        if (this.state.custom) {
            selectValue = "SELECT_VALUE_CUSTOM";
        } else {
            selectValue = this.state.levelRoleMap[selectValue] ?
                this.props.value : "SELECT_VALUE_CUSTOM";
        }
        let select;
        if (this.props.disabled) {
            select = <span>{ this.state.levelRoleMap[selectValue] }</span>;
        } else {
            // Each level must have a definition in this.state.levelRoleMap
            const levels = [0, 50, 100];
            let options = levels.map((level) => {
                return {
                    value: level,
                    // Give a userDefault (users_default in the power event) of 0 but
                    // because level !== undefined, this should never be used.
                    text: Roles.textualPowerLevel(level, 0),
                };
            });
            options.push({ value: "SELECT_VALUE_CUSTOM", text: _t("Custom level") });
            options = options.map((op) => {
                return <option value={op.value} key={op.value}>{ op.text }</option>;
            });

            select =
                <select ref="select"
                        value={this.props.controlled ? selectValue : undefined}
                        defaultValue={!this.props.controlled ? selectValue : undefined}
                        onChange={this.onSelectChange}>
                    { options }
                </select>;
        }

        return (
            <span className="mx_PowerSelector">
                { select }
                { customPicker }
            </span>
        );
    },
});
