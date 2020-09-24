/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import React, {useContext, useEffect, useMemo} from "react";
import {Resizable} from "re-resizable";
import classNames from "classnames";

import {_t} from "../../languageHandler";
import AccessibleTooltipButton from "../views/elements/AccessibleTooltipButton";
import AccessibleButton from "../views/elements/AccessibleButton";
import {useRovingTabIndex} from "../../accessibility/RovingTabIndex";
import {Key} from "../../Keyboard";
import {useLocalStorageState} from "../../hooks/useLocalStorageState";
import MatrixClientContext from "../../contexts/MatrixClientContext";
import WidgetUtils, {IWidget} from "../../utils/WidgetUtils";
import {useAccountData} from "../../hooks/useAccountData";
import AppTile from "../views/elements/AppTile";
import {useSettingValue} from "../../hooks/useSettings";

interface IProps {
    onResize(): void;
}

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 500; // or 50% of the window height
const INITIAL_HEIGHT = 280;

const LeftPanelWidget: React.FC<IProps> = ({ onResize }) => {
    const cli = useContext(MatrixClientContext);

    const mWidgetsEvent = useAccountData<Record<string, IWidget>>(cli, "m.widgets");
    const leftPanelWidgetId = useSettingValue("Widgets.leftPanel");
    const app = useMemo(() => {
        if (!mWidgetsEvent || !leftPanelWidgetId) return null;
        const widgetConfig = Object.values(mWidgetsEvent).find(w => w.id === leftPanelWidgetId);
        if (!widgetConfig) return null;

        return WidgetUtils.makeAppConfig(
            widgetConfig.state_key,
            widgetConfig.content,
            widgetConfig.sender,
            null,
            widgetConfig.id);
    }, [cli, mWidgetsEvent, leftPanelWidgetId]);

    const [height, setHeight] = useLocalStorageState("left-panel-widget-height", INITIAL_HEIGHT);
    const [expanded, setExpanded] = useLocalStorageState("left-panel-widget-expanded", true);
    useEffect(onResize, [expanded]);

    const [onFocus, isActive, ref] = useRovingTabIndex();
    const tabIndex = isActive ? 0 : -1;

    if (!app) return null;

    let auxButton = null;
    if (1) {
        auxButton = (
            <AccessibleTooltipButton
                tabIndex={tabIndex}
                onClick={() => {
                    console.log("@@ Maximise Left Panel Widget")
                }}
                className="mx_LeftPanelWidget_maximizeButton"
                tooltipClassName="mx_LeftPanelWidget_maximizeButtonTooltip"
                title={_t("Maximize")}
            />
        );
    }

    let content;
    if (expanded) {
        content = <Resizable
            size={{height} as any}
            minHeight={MIN_HEIGHT}
            maxHeight={Math.min(window.innerHeight / 2, MAX_HEIGHT)}
            onResize={onResize}
            onResizeStop={(e, dir, ref, d) => {
                setHeight(height + d.height);
            }}
            handleWrapperClass="mx_LeftPanelWidget_resizerHandles"
            handleClasses={{top: "mx_LeftPanelWidget_resizerHandle"}}
            className="mx_LeftPanelWidget_resizeBox"
            enable={{ top: true }}
        >
            <AppTile
                app={app}
                fullWidth
                show
                showMenubar={false}
                userWidget
                userId={cli.getUserId()}
                creatorUserId={app.creatorUserId}
                widgetPageTitle={WidgetUtils.getWidgetDataTitle(app)}
                waitForIframeLoad={app.waitForIframeLoad}
            />
        </Resizable>;
    }

    return <div className="mx_LeftPanelWidget">
        <div
            onFocus={onFocus}
            className={classNames({
                "mx_LeftPanelWidget_headerContainer": true,
                "mx_LeftPanelWidget_headerContainer_withAux": !!auxButton,
            })}
            onKeyDown={(ev: React.KeyboardEvent) => {
                switch (ev.key) {
                    case Key.ARROW_LEFT:
                        ev.stopPropagation();
                        setExpanded(false);
                        break;
                    case Key.ARROW_RIGHT: {
                        ev.stopPropagation();
                        setExpanded(true);
                        break;
                    }
                }
            }}
        >
            <div className="mx_LeftPanelWidget_stickable">
                <AccessibleButton
                    onFocus={onFocus}
                    inputRef={ref}
                    tabIndex={tabIndex}
                    className="mx_LeftPanelWidget_headerText"
                    role="treeitem"
                    aria-expanded={expanded}
                    aria-level={1}
                    onClick={() => {
                        setExpanded(e => !e);
                    }}
                >
                    <span className={classNames({
                        "mx_LeftPanelWidget_collapseBtn": true,
                        "mx_LeftPanelWidget_collapseBtn_collapsed": !expanded,
                    })} />
                    <span>{ WidgetUtils.getWidgetName(app) }</span>
                </AccessibleButton>
                { auxButton }
            </div>
        </div>

        { content }
    </div>;
};

export default LeftPanelWidget;