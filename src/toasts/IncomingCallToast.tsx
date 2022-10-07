/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

import React, { useCallback, useEffect } from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";

import { _t } from '../languageHandler';
import RoomAvatar from '../components/views/avatars/RoomAvatar';
import AccessibleButton from '../components/views/elements/AccessibleButton';
import { MatrixClientPeg } from "../MatrixClientPeg";
import defaultDispatcher from "../dispatcher/dispatcher";
import { ViewRoomPayload } from "../dispatcher/payloads/ViewRoomPayload";
import { Action } from "../dispatcher/actions";
import ToastStore from "../stores/ToastStore";
import AccessibleTooltipButton from "../components/views/elements/AccessibleTooltipButton";
import {
    LiveContentSummary,
    LiveContentSummaryWithCall,
    LiveContentType,
} from "../components/views/rooms/LiveContentSummary";
import { useCall } from "../hooks/useCall";
import { useRoomState } from "../hooks/useRoomState";
import { ButtonEvent } from "../components/views/elements/AccessibleButton";

export const getIncomingCallToastKey = (stateKey: string) => `call_${stateKey}`;

interface Props {
    callEvent: MatrixEvent;
}

export function IncomingCallToast({ callEvent }: Props) {
    const roomId = callEvent.getRoomId()!;
    const room = MatrixClientPeg.get().getRoom(roomId);
    const call = useCall(roomId);

    const dismissToast = useCallback((): void => {
        ToastStore.sharedInstance().dismissToast(getIncomingCallToastKey(callEvent.getStateKey()!));
    }, [callEvent]);

    const latestEvent = useRoomState(room, useCallback((state) => {
        return state.getStateEvents(callEvent.getType(), callEvent.getStateKey()!);
    }, [callEvent]));

    useEffect(() => {
        if ("m.terminated" in latestEvent.getContent()) {
            dismissToast();
        }
    }, [latestEvent, dismissToast]);

    const onJoinClick = useCallback((e: ButtonEvent): void => {
        e.stopPropagation();

        defaultDispatcher.dispatch<ViewRoomPayload>({
            action: Action.ViewRoom,
            room_id: room.roomId,
            view_call: true,
            metricsTrigger: undefined,
        });
        dismissToast();
    }, [room, dismissToast]);

    const onCloseClick = useCallback((e: ButtonEvent): void => {
        e.stopPropagation();

        dismissToast();
    }, [dismissToast]);

    return <React.Fragment>
        <RoomAvatar
            room={room ?? undefined}
            height={24}
            width={24}
        />
        <div className="mx_IncomingCallToast_content">
            <div className="mx_IncomingCallToast_info">
                <span className="mx_IncomingCallToast_room">
                    { room ? room.name : _t("Unknown room") }
                </span>
                <div className="mx_IncomingCallToast_message">
                    { _t("Video call started") }
                </div>
                { call
                    ? <LiveContentSummaryWithCall call={call} />
                    : <LiveContentSummary
                        type={LiveContentType.Video}
                        text={_t("Video")}
                        active={false}
                        participantCount={0}
                    />
                }
            </div>
            <AccessibleButton
                className="mx_IncomingCallToast_joinButton"
                onClick={onJoinClick}
                kind="primary"
            >
                { _t("Join") }
            </AccessibleButton>
        </div>
        <AccessibleTooltipButton
            className="mx_IncomingCallToast_closeButton"
            onClick={onCloseClick}
            title={_t("Close")}
        />
    </React.Fragment>;
}
