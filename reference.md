# ePWA bridge reference 3.0

Every method, event, error and permission a Pier app can use. Generated from the machine-readable spec the runtime is tested against, so this page cannot drift from the code.

Types are wire types: `string`, `number`, `integer`, `boolean`, `bytes` (`{data, encoding}`), `handle` (`{id, name, kind}`). The result column is what the method returns **before** the `window.epwa` wrapper unpacks it — `epwa.fs.list` hands your code `items`, not the whole object.

## Envelope

Every call is one message in, one message out.

- **request**: `{ id: number, method: string, params: object }`
- **result**: `{ id: number, ok: true, result: object }`
- **error**: `{ id: number, ok: false, error: { code: string, message: string } }`

Binary values travel as `{data, encoding}` with `encoding` either `utf8` or `base64`; the wrapper turns base64 into a `Uint8Array` and back. A missing value is an explicit `null`, never an omitted key.

## Window methods

Available without any manifest permission.

#### `epwa.ping`

Liveness check of the bridge.

Result
: { pong: boolean }

#### `epwa.getInfo`

Runtime, API version, platform and capabilities.

Result
: { runtime: string, apiVersion: string, platform: string, osVersion: string, capabilities: string[], permissions: string[], mode: `dev` \| `app` \| `pier` }

#### `epwa.setDragRegions`

Push the page's --app-region rectangles to the host.

Parameters
: `drag`?: [Rect](#rect)[], `noDrag`?: [Rect](#rect)[]

Result
: { count: integer }

#### `epwa.drag.setSources`

Declare the page areas that can be dragged out of the window.

Parameters
: `sources`?: [DragSource](#dragsource)[]

Result
: { count: integer }

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.getTrafficLights`

Current traffic-light buttons state.

Result
: [TrafficLights](#trafficlights)

#### `epwa.setTrafficLights`

Move, hide or recolor the traffic-light buttons.

Parameters
: `visible`?: boolean, `offsetX`?: number, `offsetY`?: number, `color`?: `light` \| `dark` \| `auto`

Result
: [TrafficLights](#trafficlights)

#### `epwa.getTitlebarArea`

Titlebar area in CSS px (like env(titlebar-area-*)).

Result
: [Rect](#rect)

#### `epwa.getWindowState`

Focus, zoom, fullscreen and size of the window.

Result
: [WindowState](#windowstate)

#### `epwa.maximize`

Zoom the window to the visible screen frame.

Result
: {}

#### `epwa.unmaximize`

Return the window to its pre-zoom frame.

Result
: {}

#### `epwa.minimize`

Miniaturize the window into the Dock.

Result
: {}

#### `epwa.close`

Close the window; force: true bypasses the close guard.

Parameters
: `force`?: boolean = `false`

Result
: { closed: boolean }

#### `epwa.setCloseGuard`

Intercept window close and ⌘Q; the page gets close-request.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

#### `epwa.setBackgroundMode`

Closing the window hides it; the process keeps running.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

#### `epwa.showWindow`

Show a hidden or minimized window and activate the app.

Result
: {}

#### `epwa.setMenu`

Page menus inserted into the main menu bar.

Parameters
: `menus`?: [MenuSpec](#menuspec)[]

Result
: { count: integer }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setDockMenu`

Dock icon menu.

Parameters
: `items`?: [MenuItem](#menuitem)[]

Result
: { count: integer }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setWindowSize`

Content size in points; the top-left corner stays put.

Parameters
: `width`: number, `height`: number, `animate`?: boolean = `true`

Result
: { width: number, height: number }

Errors
: `E_BAD_PARAMS`

#### `epwa.setMinWindowSize`

Minimum content size (480×320 by default).

Parameters
: `width`: number, `height`: number

Result
: { width: number, height: number }

Errors
: `E_BAD_PARAMS`

#### `epwa.useWindowFrame`

Window position slot: each mode remembers its own frame.

Parameters
: `name`?: string, `width`?: number, `height`?: number, `animate`?: boolean = `true`

Result
: { name: string }

Errors
: `E_BAD_PARAMS`

#### `epwa.setAlwaysOnTop`

Keep the window above the others.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

#### `epwa.setFullScreen`

Native full screen; fires fullscreenenter/exit.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

#### `epwa.setDockIcon`

Dock icon from a page image; '' resets it.

Parameters
: `url`?: string

Result
: { reset: boolean }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setStatusItem`

Menu bar item; null removes it.

Parameters
: `item`?: [StatusItemSpec](#statusitemspec) \| null

Result
: { visible: boolean }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setWindowMaterial`

Window glass material; null is an ordinary opaque window.

Parameters
: `material`?: `hud` \| `popover` \| `menu` \| `sidebar` \| `sheet` \| `titlebar` \| `headerView` \| `underWindow` \| `windowBackground` \| `contentBackground` \| `fullScreenUI` \| `tooltip` \| `clear` \| null, `appearance`?: `auto` \| `dark` \| `light` = `"auto"`

Result
: { material: string \| null }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.getWindowCorners`

Current corner radius and the system one.

Result
: { radius: number \| null, systemRadius: number }

Errors
: `E_UNAVAILABLE`

#### `epwa.setWindowCorners`

Round the window corners; 'system' or null restores the system shape.

Parameters
: `radius`?: number \| `system` \| null

Result
: { radius: number \| null, systemRadius: number }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setDockProgress`

Progress bar over the Dock icon; null removes it.

Parameters
: `value`?: number \| null, `color`?: string

Result
: { value: number \| null }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.setGlobalShortcuts`

System-wide hotkeys; the set is replaced as a whole.

Parameters
: `shortcuts`?: [ShortcutSpec](#shortcutspec)[]

Result
: { registered: string[], failed: string[] }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.showContextMenu`

Native context menu at a page point; resolves after it closes.

Parameters
: `items`?: [MenuItem](#menuitem)[], `x`?: number = `0`, `y`?: number = `0`

Result
: { id: string \| null }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.copyToClipboard`

Put text on the general pasteboard.

Parameters
: `text`: string

Result
: { length: integer }

Errors
: `E_BAD_PARAMS`

#### `epwa.haptic`

Force Touch trackpad feedback.

Parameters
: `pattern`?: `generic` \| `alignment` \| `levelChange` \| `level` = `"generic"`

Result
: { pattern: string }

Errors
: `E_BAD_PARAMS`

#### `epwa.setAbout`

Page additions to the About panel.

Parameters
: `details`?: string[], `links`?: [AboutLink](#aboutlink)[], `accent`?: string

Result
: { details: integer, links: integer }

Errors
: `E_BAD_PARAMS`, `E_UNAVAILABLE`

#### `epwa.print`

System print dialog for the page.

Result
: {}

Errors
: `E_UNAVAILABLE`

#### `epwa.setFindHandling`

The page takes ⌘F for its own search; reset to false on navigation.

Parameters
: `page`?: boolean = `false`

Result
: { page: boolean }

#### `epwa.setSettingsHandling`

Standard “Settings…” (⌘,) item in the app menu; choosing it sends the settings event.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

#### `epwa.setNavigationGestures`

Two-finger back/forward swipes; off by default.

Parameters
: `enabled`?: boolean = `false`

Result
: { enabled: boolean }

## Native modules

### `permissions.*`

What the manifest declares and what the user allowed.

No manifest permission needed.

#### `epwa.permissions.query`

State of one permission without asking the user.

Parameters
: `name`: string

Result
: [PermissionState](#permissionstate)

Errors
: `E_BAD_PARAMS`

#### `epwa.permissions.request`

Ask for consent up front (for permissions that have a question).

Parameters
: `name`: string

Result
: [PermissionState](#permissionstate)

Errors
: `E_BAD_PARAMS`

#### `epwa.permissions.list`

All known permissions with their states.

Result
: { permissions: [PermissionState](#permissionstate)[] }

### `dialog.*`

System sheets: message, confirmation, text input, open and save panels.

No manifest permission needed.

#### `epwa.dialog.alert`

Message with up to 4 buttons.

Parameters
: `title`?: string, `message`?: string, `style`?: `info` \| `warning` \| `critical` = `"info"`, `buttons`?: string[]

Result
: { button: integer }

Errors
: `E_BAD_PARAMS`

#### `epwa.dialog.confirm`

Yes/no question.

Parameters
: `title`?: string, `message`?: string, `ok`?: string, `cancel`?: string, `destructive`?: boolean = `false`

Result
: { confirmed: boolean }

Errors
: `E_BAD_PARAMS`

#### `epwa.dialog.prompt`

Single-line text input.

Parameters
: `title`?: string, `message`?: string, `defaultValue`?: string, `placeholder`?: string, `secure`?: boolean = `false`

Result
: { value: string \| null }

Errors
: `E_BAD_PARAMS`

#### `epwa.dialog.open`

Open panel; the chosen files or folders become handles.

Parameters
: `title`?: string, `message`?: string, `button`?: string, `multiple`?: boolean = `false`, `directories`?: boolean = `false`, `types`?: string[]

Result
: { items?: [Handle](#handle)[], cancelled?: boolean }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.dialog.save`

Save panel; the file may not exist yet.

Parameters
: `title`?: string, `message`?: string, `button`?: string, `suggestedName`?: string, `types`?: string[]

Result
: { item?: [Handle](#handle), cancelled?: boolean }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

### `fs.*`

Files inside handles the user picked and in the app's own folder.

Needs `files` in the manifest.

#### `epwa.fs.appData`

Handle of the app's private folder.

Result
: [Handle](#handle)

Permission
: `files`

#### `epwa.fs.handles`

Handles issued earlier; they survive restarts.

Result
: { items: [Handle](#handle)[] }

Permission
: `files`

#### `epwa.fs.forget`

Drop a stored handle.

Parameters
: `handle`: handle

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`

#### `epwa.fs.exists`

Does the path exist inside the handle.

Parameters
: `handle`: handle, `path`?: string

Result
: { exists: boolean }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.fs.stat`

Name, kind, size and dates.

Parameters
: `handle`: handle, `path`?: string

Result
: [StatEntry](#statentry)

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.list`

Directory contents sorted by name (up to 10 000 entries).

Parameters
: `handle`: handle, `path`?: string, `hidden`?: boolean = `false`

Result
: { items: [DirEntry](#direntry)[], truncated: boolean }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.read`

Read a file or a slice of it; up to 64 MB per call.

Parameters
: `handle`: handle, `path`?: string, `as`?: `utf8` \| `base64` = `"base64"`, `offset`?: integer = `0`, `length`?: integer

Result
: { data: string, encoding: `utf8` \| `base64`, size: integer }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.write`

Write a file atomically (or append); missing folders are created.

Parameters
: `handle`: handle, `path`?: string, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"utf8"`, `append`?: boolean = `false`

Result
: { size: integer }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.mkdir`

Create a directory with its intermediates.

Parameters
: `handle`: handle, `path`: string

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.fs.remove`

Move to the Trash (or delete for good with trash: false).

Parameters
: `handle`: handle, `path`?: string, `trash`?: boolean = `true`

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.move`

Move inside the handle or into another handle.

Parameters
: `handle`: handle, `from`: string, `to`: string, `toHandle`?: handle, `overwrite`?: boolean = `false`

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.copy`

Copy inside the handle or into another handle.

Parameters
: `handle`: handle, `from`: string, `to`: string, `toHandle`?: handle, `overwrite`?: boolean = `false`

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.reveal`

Show the item in Finder.

Parameters
: `handle`: handle, `path`?: string

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.fs.watch`

Watch a folder or file; changes arrive as fs-change. No subfolders.

Parameters
: `handle`: handle, `path`?: string

Result
: { watch: string }

Permission
: `files`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.fs.unwatch`

Stop watching.

Parameters
: `watch`: string

Result
: {}

Permission
: `files`

Errors
: `E_BAD_PARAMS`

### `launch.*`

Files the app was opened with (file_handlers); no "files" permission needed.

No manifest permission needed.

#### `launch.read`

Read a launch file by its handle; up to 64 MB.

Used by a shim, not called directly.

Parameters
: `handle`: handle, `as`?: `utf8` \| `base64` = `"base64"`, `offset`?: integer = `0`, `length`?: integer

Result
: { data: string, encoding: `utf8` \| `base64`, size: integer }

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

### `net.*`

HTTP without CORS, TCP/TLS/UDP sockets, Bonjour discovery, incoming connections, network status.

Needs `network` in the manifest.

#### `epwa.net.status`

Network status; no permission required.

Result
: [NetStatus](#netstatus)

#### `epwa.net.watchStatus`

Subscribe to network-change and return the current status.

Result
: [NetStatus](#netstatus)

#### `epwa.net.fetch`

HTTP request without CORS; its own in-memory cookies; up to 64 MB.

Parameters
: `url`: string, `method`?: string = `"GET"`, `headers`?: map&lt;string, string&gt;, `body`?: bytes, `bodyEncoding`?: `utf8` \| `base64` = `"utf8"`, `redirect`?: `follow` \| `manual` = `"follow"`, `timeout`?: number = `60`, `as`?: `utf8` \| `base64` = `"utf8"`

Result
: { status: integer, url: string, headers: map&lt;string, string&gt;, data: string, encoding: `utf8` \| `base64` }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.connect`

Open a TCP/TLS/UDP socket; up to 64 at a time.

Parameters
: `host`: string, `port`: integer, `protocol`?: `tcp` \| `udp` = `"tcp"`, `tls`?: boolean = `false`, `timeout`?: number = `15`

Result
: { socket: string }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.send`

Send bytes or text into an open socket.

Parameters
: `socket`: string, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"utf8"`

Result
: { sent: integer }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.close`

Close a socket; socket-close follows.

Parameters
: `socket`: string

Result
: {}

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.net.browse`

Browse the local network for a Bonjour service type declared in the manifest.

Parameters
: `type`: string, `domain`?: string

Result
: { browse: string }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.resolve`

Resolve a found service to an address, port and TXT record.

Parameters
: `browse`: string, `name`: string, `timeout`?: number = `10`

Result
: { host: string, port: integer, addresses: string[], txt: map&lt;string, string&gt; }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.stopBrowse`

Stop a browse; no more net-service-found events.

Parameters
: `browse`: string

Result
: {}

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.net.listen`

Accept incoming connections; loopback by default, "lan" asks the user separately.

Parameters
: `port`?: integer = `0`, `protocol`?: `tcp` \| `udp` = `"tcp"`, `interface`?: `loopback` \| `lan` = `"loopback"`, `advertise`?: { name: string, type: string, txt?: map&lt;string, string&gt; }, `timeout`?: number = `10`

Result
: { listener: string, port: integer }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.sendTo`

Send a datagram back to a peer the UDP listener already heard from.

Parameters
: `listener`: string, `host`: string, `port`: integer, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"utf8"`

Result
: { sent: integer }

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.net.stopListen`

Stop a listener; accepted TCP sockets stay open.

Parameters
: `listener`: string

Result
: {}

Permission
: `network`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`

### `serial.*`

Serial ports (USB adapters, Arduino); the user picks the port.

Needs `serial` in the manifest.

#### `epwa.serial.getPorts`

Ports chosen earlier and connected now.

Result
: { ports: [SerialPort](#serialport)[] }

Permission
: `serial`

Errors
: `E_DENIED`

#### `epwa.serial.requestPort`

Ask the user to pick a port.

Parameters
: `filters`?: [UsbFilter](#usbfilter)[]

Result
: [SerialPort](#serialport)

Permission
: `serial`

Errors
: `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED`

#### `epwa.serial.forget`

Forget the port choice and close it.

Parameters
: `port`: string

Result
: {}

Permission
: `serial`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.serial.open`

Open the port exclusively; then serial-data / serial-close.

Parameters
: `port`: string, `baudRate`?: integer = `9600`, `dataBits`?: integer = `8`, `stopBits`?: integer = `1`, `parity`?: `none` \| `even` \| `odd` = `"none"`, `flowControl`?: `none` \| `hardware` \| `software` = `"none"`

Result
: {}

Permission
: `serial`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.serial.write`

Write bytes or text to the port.

Parameters
: `port`: string, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"utf8"`

Result
: { written: integer }

Permission
: `serial`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.serial.setSignals`

Set DTR / RTS / break (an Arduino reset, for example).

Parameters
: `port`: string, `dtr`?: boolean, `rts`?: boolean, `brk`?: boolean

Result
: {}

Permission
: `serial`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.serial.close`

Close the port.

Parameters
: `port`: string

Result
: {}

Permission
: `serial`

Errors
: `E_BAD_PARAMS`, `E_DENIED`

### `usb.*`

USB devices without a system driver (like WebUSB).

Needs `usb` in the manifest.

#### `epwa.usb.getDevices`

Devices chosen earlier and connected now.

Result
: { devices: [UsbDevice](#usbdevice)[] }

Permission
: `usb`

Errors
: `E_DENIED`

#### `epwa.usb.requestDevice`

Ask the user to pick a device.

Parameters
: `filters`?: [UsbFilter](#usbfilter)[]

Result
: [UsbDevice](#usbdevice)

Permission
: `usb`

Errors
: `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED`

#### `epwa.usb.forget`

Forget the device choice.

Parameters
: `device`: string

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.open`

Open the device.

Parameters
: `device`: string

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.close`

Close the device.

Parameters
: `device`: string

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.selectConfiguration`

Select a USB configuration.

Parameters
: `device`: string, `value`: integer

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.claimInterface`

Claim an interface.

Parameters
: `device`: string, `interface`: integer

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.releaseInterface`

Release an interface.

Parameters
: `device`: string, `interface`: integer

Result
: {}

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.controlTransferIn`

Control transfer, device → page.

Parameters
: `device`: string, `requestType`?: `standard` \| `class` \| `vendor` = `"vendor"`, `recipient`?: `device` \| `interface` \| `endpoint` \| `other` = `"device"`, `request`: integer, `value`?: integer = `0`, `index`?: integer = `0`, `length`: integer, `timeout`?: number = `5`

Result
: [Binary](#binary)

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.controlTransferOut`

Control transfer, page → device.

Parameters
: `device`: string, `requestType`?: `standard` \| `class` \| `vendor` = `"vendor"`, `recipient`?: `device` \| `interface` \| `endpoint` \| `other` = `"device"`, `request`: integer, `value`?: integer = `0`, `index`?: integer = `0`, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`, `timeout`?: number = `5`

Result
: { written: integer }

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.transferIn`

Bulk/interrupt transfer, device → page (endpoint 1…15).

Parameters
: `device`: string, `endpoint`: integer, `length`: integer, `timeout`?: number = `5`

Result
: [Binary](#binary)

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.usb.transferOut`

Bulk/interrupt transfer, page → device.

Parameters
: `device`: string, `endpoint`: integer, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`, `timeout`?: number = `5`

Result
: { written: integer }

Permission
: `usb`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

### `hid.*`

HID devices you choose (like WebHID); keyboards, pointing devices and security keys are never offered.

Needs `hid` in the manifest.

#### `epwa.hid.getDevices`

Devices chosen earlier and connected now.

Result
: { devices: [HidDevice](#hiddevice)[] }

Permission
: `hid`

Errors
: `E_DENIED`

#### `epwa.hid.requestDevice`

Ask the user to pick a device.

Parameters
: `filters`?: [HidFilter](#hidfilter)[]

Result
: [HidDevice](#hiddevice)

Permission
: `hid`

Errors
: `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED`

#### `epwa.hid.forget`

Forget the device choice.

Parameters
: `device`: string

Result
: {}

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.hid.open`

Open the device.

Parameters
: `device`: string

Result
: {}

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.hid.close`

Close the device.

Parameters
: `device`: string

Result
: {}

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.hid.sendReport`

Send an output report.

Parameters
: `device`: string, `reportId`?: integer = `0`, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`

Result
: { written: integer }

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.hid.sendFeatureReport`

Send a feature report.

Parameters
: `device`: string, `reportId`?: integer = `0`, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`

Result
: { written: integer }

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.hid.receiveFeatureReport`

Read a feature report.

Parameters
: `device`: string, `reportId`?: integer = `0`

Result
: [Binary](#binary)

Permission
: `hid`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

### `bluetooth.*`

Bluetooth LE, like Web Bluetooth: the user picks the device.

Needs `bluetooth` in the manifest.

#### `epwa.bluetooth.getAvailability`

Is Bluetooth LE available and in what state.

Result
: { available: boolean, state: `poweredOn` \| `poweredOff` \| `unauthorized` \| `unsupported` \| `resetting` \| `unknown` }

Permission
: `bluetooth`

Errors
: `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.requestDevice`

Scan and let the user pick a device.

Parameters
: `filters`?: [BluetoothFilter](#bluetoothfilter)[], `optionalServices`?: string[]

Result
: [BluetoothDevice](#bluetoothdevice)

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`, `E_CANCELLED`

#### `epwa.bluetooth.getDevices`

Devices chosen earlier.

Result
: { devices: [BluetoothDevice](#bluetoothdevice)[] }

Permission
: `bluetooth`

Errors
: `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.forget`

Forget the device and disconnect.

Parameters
: `device`: string

Result
: {}

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.connect`

Connect and discover the allowed services.

Parameters
: `device`: string, `timeout`?: number = `15`

Result
: { services: [BluetoothService](#bluetoothservice)[] }

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.disconnect`

Disconnect from the device.

Parameters
: `device`: string

Result
: {}

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.read`

Read a characteristic value.

Parameters
: `device`: string, `service`: string, `characteristic`: string, `timeout`?: number = `10`

Result
: [Binary](#binary)

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.write`

Write a characteristic value.

Parameters
: `device`: string, `service`: string, `characteristic`: string, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`, `withResponse`?: boolean = `true`, `timeout`?: number = `10`

Result
: { written: integer }

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.startNotifications`

Subscribe to characteristic values (bluetooth-value).

Parameters
: `device`: string, `service`: string, `characteristic`: string, `timeout`?: number = `10`

Result
: {}

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.bluetooth.stopNotifications`

Unsubscribe from characteristic values.

Parameters
: `device`: string, `service`: string, `characteristic`: string, `timeout`?: number = `10`

Result
: {}

Permission
: `bluetooth`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

### `midi.*`

MIDI devices through CoreMIDI; the base of the Web MIDI shim.

Needs `midi` in the manifest.

#### `epwa.midi.access`

Port lists and the clock origin; sysex: true asks for a separate consent.

Parameters
: `sysex`?: boolean = `false`

Result
: { inputs: [MidiPort](#midiport)[], outputs: [MidiPort](#midiport)[], sysex: boolean, now: number }

Permission
: `midi`, plus a question to the person

Errors
: `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.midi.open`

Open a MIDI input; messages arrive as midi-message. Up to 32 at a time.

Parameters
: `port`: string

Result
: {}

Permission
: `midi`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.midi.close`

Close a MIDI input.

Parameters
: `port`: string

Result
: {}

Permission
: `midi`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`

#### `epwa.midi.send`

Send messages to an output; up to 64 KB, SysEx only after midi.access({sysex: true}).

Parameters
: `port`: string, `data`: bytes, `encoding`?: `utf8` \| `base64` = `"base64"`, `timestamp`?: number

Result
: { sent: integer }

Permission
: `midi`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

### `power.*`

Keep the system (or display) awake; power source, battery, user idle time and system events.

No manifest permission needed.

#### `epwa.power.preventSleep`

Take a sleep assertion; hold the token while the work lasts.

Parameters
: `display`?: boolean = `false`, `reason`?: string

Result
: { token: string }

Errors
: `E_UNAVAILABLE`

#### `epwa.power.allowSleep`

Release the assertion.

Parameters
: `token`: string

Result
: {}

Errors
: `E_BAD_PARAMS`

#### `epwa.power.status`

Power source and battery level.

Result
: { source: `ac` \| `battery`, battery?: { level: number, charging: boolean } }

#### `epwa.power.idleTime`

Seconds since the last user input, rounded and throttled to once a second.

Result
: { seconds: number }

#### `epwa.power.watchSystem`

Subscribe to sleep, wake, display and screen-lock events.

Result
: {}

#### `epwa.power.unwatchSystem`

Unsubscribe from the system events.

Result
: {}

### `location.*`

CoreLocation fixes in the W3C shape.

Needs `location` in the manifest.

#### `epwa.location.getCurrentPosition`

One position fix.

Parameters
: `accuracy`?: `fine` \| `coarse` = `"fine"`, `timeout`?: number = `15`, `maximumAge`?: number = `0`

Result
: [Position](#position)

Permission
: `location`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.location.watchPosition`

Subscribe to location-update / location-error; up to 16 watches.

Parameters
: `accuracy`?: `fine` \| `coarse` = `"fine"`, `timeout`?: number = `15`, `maximumAge`?: number = `0`

Result
: { token: string }

Permission
: `location`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.location.clearWatch`

Cancel a watch.

Parameters
: `token`: string

Result
: {}

Permission
: `location`, plus a question to the person

Errors
: `E_BAD_PARAMS`, `E_DENIED`

### `notifications.*`

macOS notifications with buttons, a reply field, attachments and scheduling.

Needs `notifications` in the manifest.

#### `epwa.notifications.getPermission`

System notification authorization state.

Result
: { state: `granted` \| `denied` \| `prompt` }

Permission
: `notifications`

Errors
: `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.notifications.requestPermission`

Ask the system for notification authorization.

Result
: { state: `granted` \| `denied` \| `prompt` }

Permission
: `notifications`

Errors
: `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.notifications.show`

Show (or schedule) a notification; the same id replaces the previous one.

Parameters
: `title`: string, `body`?: string, `subtitle`?: string, `sound`?: boolean = `true`, `id`?: string, `actions`?: [NotificationAction](#notificationaction)[], `replyButton`?: { title?: string }, `reply`?: boolean = `false`, `attachments`?: [NotificationAttachment](#notificationattachment)[], `schedule`?: [NotificationSchedule](#notificationschedule)

Result
: { id: string }

Permission
: `notifications`

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.notifications.clear`

Remove a notification by id, or all of them.

Parameters
: `id`?: string

Result
: {}

Permission
: `notifications`

Errors
: `E_DENIED`, `E_UNAVAILABLE`

### `secrets.*`

Strings in the app's own Keychain service.

No manifest permission needed.

#### `epwa.secrets.set`

Store a value (up to 64 KB).

Parameters
: `key`: string, `value`: string, `protected`?: boolean = `false`

Result
: {}

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.secrets.get`

Read a value; null when there is none.

Parameters
: `key`: string, `reason`?: string

Result
: { value: string \| null }

Errors
: `E_BAD_PARAMS`, `E_CANCELLED`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.secrets.delete`

Remove a value.

Parameters
: `key`: string

Result
: {}

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.secrets.keys`

All stored keys, sorted.

Result
: { keys: string[], protected: string[] }

Errors
: `E_DENIED`, `E_UNAVAILABLE`

### `auth.*`

System owner check (Touch ID, falling back to the account password) — no manifest permission.

No manifest permission needed.

#### `epwa.auth.available`

Whether the system can ask (Touch ID or account password).

Result
: { biometry: `touchID` \| `none`, canAuthenticate: boolean }

#### `epwa.auth.confirm`

Ask the system to confirm it's the Mac's owner; the system shows reason.

Parameters
: `reason`?: string

Result
: { ok: boolean }

Errors
: `E_CANCELLED`, `E_DENIED`, `E_UNAVAILABLE`

### `clipboard.*`

System pasteboard: multiple representations, reading, file handles.

No manifest permission needed.

#### `epwa.clipboard.write`

Replace the clipboard with several representations of the same content.

Parameters
: `items`: [ClipboardItem](#clipboarditem)[]

Result
: { count: integer }

Errors
: `E_BAD_PARAMS`

#### `epwa.clipboard.read`

Read the clipboard; empty and concealed: true when it holds a password manager's hidden content.

Parameters
: `types`?: string[]

Result
: { items: [ClipboardItem](#clipboarditem)[], concealed: boolean }

Permission
: `clipboard-read`, plus a question to the person

Errors
: `E_DENIED`

#### `epwa.clipboard.types`

Which representations are available, without reading content.

Result
: { types: string[], concealed: boolean }

Permission
: `clipboard-read`, plus a question to the person

Errors
: `E_DENIED`

#### `epwa.clipboard.clear`

Empty the clipboard.

Result
: {}

### `app.*`

Dock badge, attention, external links, sharing, launch at login, storage reset.

No manifest permission needed.

#### `epwa.app.setBadge`

Dock badge text; empty removes it.

Parameters
: `text`?: string

Result
: { text: string }

#### `epwa.app.requestAttention`

Bounce the Dock icon.

Parameters
: `critical`?: boolean = `false`

Result
: {}

#### `epwa.app.openExternal`

Open a link in the system: http(s), mailto:, tel:, facetime:, sms:.

Parameters
: `url`: string

Result
: { opened: boolean }

Errors
: `E_BAD_PARAMS`

#### `epwa.app.share`

System share sheet at a point of the window.

Parameters
: `text`?: string, `url`?: string, `files`?: handle[], `x`?: number, `y`?: number

Result
: { items: integer }

Errors
: `E_BAD_PARAMS`, `E_DENIED`, `E_UNAVAILABLE`

#### `epwa.app.clearData`

Clear the app's whole website storage (all origins).

Parameters
: `types`?: `cookies` \| `diskCache` \| `localStorage` \| `sessionStorage` \| `indexedDB` \| `serviceWorkers` \| `cacheStorage`[]

Result
: { cleared: integer }

Errors
: `E_BAD_PARAMS`

#### `epwa.app.getLaunchAtLogin`

Launch at login state.

Result
: [LaunchAtLogin](#launchatlogin)

Errors
: `E_UNAVAILABLE`

#### `epwa.app.setLaunchAtLogin`

Turn launch at login on or off.

Parameters
: `enabled`?: boolean = `false`

Result
: [LaunchAtLogin](#launchatlogin)

Errors
: `E_UNAVAILABLE`

## Events

`epwa.on(event, handler)` returns an unsubscribe function.

| Event | What it means | Payload |
| --- | --- | --- |
| `ready` | The bridge answered the bootstrap handshake. | { apiVersion: string } |
| `titlebarareachange` | The titlebar area changed (resize). | [Rect](#rect) |
| `themechange` | The system appearance changed. | { scheme: `dark` \| `light` } |
| `maximize` | The window was zoomed. | { manual?: boolean } |
| `unmaximize` | The window left the zoomed frame. | { manual?: boolean } |
| `fullscreenenter` | The window entered full screen. | {} |
| `fullscreenexit` | The window left full screen. | {} |
| `focus` | The window became key. | {} |
| `blur` | The window lost key status. | {} |
| `close-request` | Close was intercepted by the close guard. Turned on by `setCloseGuard`. | { reason: `close` \| `quit` } |
| `hide` | The window was hidden by closing it in background mode. Turned on by `setBackgroundMode`. | {} |
| `show` | The window came back. | {} |
| `menu` | A page menu, Dock menu or status item entry was chosen. Turned on by `setMenu`. | { id: string, source: `menu` \| `dock` \| `status` } |
| `settings` | The Settings… item (or ⌘,) was chosen. Turned on by `setSettingsHandling`. | {} |
| `shortcut` | A global hotkey fired. Turned on by `setGlobalShortcuts`. | { id: string } |
| `notification-click` | The user clicked a notification. Turned on by `notifications.show`. | { id: string } |
| `notification-action` | An action button was pressed. Turned on by `notifications.show`. | { id: string, actionId: string } |
| `notification-reply` | The user typed a quick reply. Turned on by `notifications.show`. | { id: string, text: string } |
| `download` | A WebKit download changed state. | { name: string, state: `started` \| `finished` \| `failed`, error?: string } |
| `popup-blocked` | window.open was blocked. | { url: string, reason: `no-user-gesture` \| `too-many-popups` \| `nested-popup` \| `foreign-frame` } |
| `launch-files` | The app was opened with files (feeds the launchQueue shim). | { files: [Handle](#handle)[], batch?: string } |
| `files-dropped` | Files or folders were dropped on the window (handles for epwa.fs). | { files: [Handle](#handle)[], x: number, y: number } |
| `drag-end` | A drag session started from the window ended. | { operation: `none` \| `copy` \| `move` \| `link` } |
| `fs-change` | A watched file or folder changed. Turned on by `fs.watch`. | { watch: string, event: `write` \| `delete` \| `rename` \| `attrib` } |
| `network-change` | The network path changed. Turned on by `net.watchStatus`. | [NetStatus](#netstatus) |
| `socket-data` | Bytes arrived on a socket. Turned on by `net.connect`. | { socket: string, data: bytes } |
| `socket-close` | A socket closed. Turned on by `net.connect`. | { socket: string, error?: string } |
| `net-service-found` | A Bonjour service appeared on the local network. Turned on by `net.browse`. | { browse: string, service: [NetService](#netservice) } |
| `net-service-lost` | A Bonjour service disappeared. Turned on by `net.browse`. | { browse: string, service: [NetService](#netservice) } |
| `net-connection` | A listener accepted an incoming connection. Turned on by `net.listen`. | { listener: string, socket: string, remote: { host: string, port: integer } } |
| `net-datagram` | A datagram arrived at a UDP listener. Turned on by `net.listen`. | { listener: string, data: bytes, remote: { host: string, port: integer } } |
| `serial-data` | Bytes arrived from a serial port. Turned on by `serial.open`. | { port: string, data: bytes } |
| `serial-close` | The port closed, including when the adapter was unplugged. Turned on by `serial.open`. | { port: string, error?: string } |
| `usb-connect` | A chosen USB device was plugged in. Turned on by `usb.getDevices`. | { device: [UsbDevice](#usbdevice) } |
| `usb-disconnect` | A chosen USB device was unplugged. Turned on by `usb.getDevices`. | { device: [UsbDevice](#usbdevice) } |
| `hid-inputreport` | An input report arrived from an open HID device. Turned on by `hid.open`. | { device: string, reportId: integer, data: bytes } |
| `hid-connect` | A chosen HID device was plugged in. Turned on by `hid.getDevices`. | { device: [HidDevice](#hiddevice) } |
| `hid-disconnect` | A chosen HID device was unplugged. Turned on by `hid.getDevices`. | { device: [HidDevice](#hiddevice) } |
| `bluetooth-value` | A subscribed characteristic sent a value. Turned on by `bluetooth.startNotifications`. | { device: string, service: string, characteristic: string, data: bytes } |
| `bluetooth-disconnect` | The device disconnected. Turned on by `bluetooth.connect`. | { device: string, error?: string } |
| `midi-message` | A message arrived from an open MIDI input. Turned on by `midi.open`. | { port: string, data: bytes, timestamp: number } |
| `midi-statechange` | A MIDI port appeared or disappeared. Turned on by `midi.access`. | { port: [MidiPortState](#midiportstate) } |
| `location-update` | A new position fix for a watch. Turned on by `location.watchPosition`. | { token: string, coords: [Coords](#coords), timestamp: number } |
| `location-error` | A watch failed. Turned on by `location.watchPosition`. | { token: string, code: string, message: string } |
| `system-sleep` | The Mac is going to sleep. Turned on by `power.watchSystem`. | {} |
| `system-wake` | The Mac woke up. Turned on by `power.watchSystem`. | {} |
| `screens-sleep` | The displays went to sleep. Turned on by `power.watchSystem`. | {} |
| `screens-wake` | The displays woke up. Turned on by `power.watchSystem`. | {} |
| `screen-lock` | The screen was locked. Turned on by `power.watchSystem`. | {} |
| `screen-unlock` | The screen was unlocked. Turned on by `power.watchSystem`. | {} |

## Error codes

| Code | Meaning |
| --- | --- |
| `E_UNKNOWN_METHOD` | No such bridge method or namespace. |
| `E_BAD_PARAMS` | Parameters are missing or of the wrong type. |
| `E_UNSUPPORTED` | The host does not support this (for example an API version mismatch). |
| `E_UNAVAILABLE` | Temporarily impossible: no window, device not connected, system refused. |
| `E_DENIED` | Not allowed: foreign origin, permission not declared in the manifest, or the user said no. |
| `E_CANCELLED` | The user cancelled the dialog or the device picker. |

## Manifest permissions

Declared as `"epwa": {"permissions": [...]}` in `manifest.webmanifest`.

| Permission | The app may use | Asks the person |
| --- | --- | --- |
| `files` | files and folders you choose | no |
| `network` | direct connections to servers and devices on the network | yes |
| `bluetooth` | Bluetooth devices you choose | no |
| `usb` | USB devices you choose | no |
| `hid` | HID devices you choose | no |
| `serial` | serial ports (Arduino and the like) you choose | no |
| `midi` | MIDI devices | yes |
| `notifications` | notifications | no |
| `camera` | the camera, with your permission | yes |
| `microphone` | the microphone, with your permission | yes |
| `location` | your location, with your permission | yes |
| `clipboard-read` | reading the clipboard | yes |
| `screen` | screen sharing — you pick what to show | no |

## Capabilities

`(await epwa.getInfo()).capabilities` reports this list plus the namespaces the app actually got.

`dragRegions`, `trafficLights`, `titlebarArea`, `window`, `closeGuard`, `backgroundMode`, `menu`, `dockMenu`, `mediaSession`, `windowSize`, `alwaysOnTop`, `fullScreen`, `dockIcon`, `statusItem`, `windowMaterial`, `dockProgress`, `globalShortcuts`, `contextMenu`, `clipboard`, `haptic`, `windowFrames`, `about`, `print`, `findHandling`, `settings`, `fileDrop`, `dragSources`

## Web API shims

Standard APIs Pier implements on top of the bridge.

| Replaces | Built on | When | Note |
| --- | --- | --- | --- |
| `window.print` | `print` | always | WKWebView has window.print but it does nothing, so the shim is installed unconditionally. |
| `navigator.wakeLock` | `power.preventSleep`, `power.allowSleep` | only if the platform has none | Screen Wake Lock API over epwa.power; sentinels auto-release when the document is hidden. |
| `window.launchQueue` | `launch.read` | only if the platform has none | Launch Queue for file_handlers: handles with getFile(); up to 64 MB per file. |
| `window.Notification` | `notifications.show`, `notifications.clear`, `notifications.getPermission`, `notifications.requestPermission` | only if the platform has none | Notification API over epwa.notifications; tag maps to the native id. |
| `navigator.setAppBadge / navigator.clearAppBadge` | `app.setBadge` | only if the platform has none | Badging API; errors are swallowed the way browsers do. |
| `navigator.share` | `app.share` | only if the platform has none | Web Share API without files; no data is a TypeError. |
| `navigator.geolocation` | `location.getCurrentPosition`, `location.watchPosition`, `location.clearWatch` | always | Installed unconditionally: WKWebView has geolocation before macOS 27 but requests never complete. |
| `navigator.requestMIDIAccess` | `midi.access`, `midi.open`, `midi.close`, `midi.send` | only if the platform has none | Web MIDI API over epwa.midi: MIDIAccess, MIDIInput/MIDIOutput, onmidimessage. |
| `navigator.hid` | `hid.getDevices`, `hid.requestDevice`, `hid.forget`, `hid.open`, `hid.close`, `hid.sendReport`, `hid.sendFeatureReport`, `hid.receiveFeatureReport` | only if the platform has none | WebHID over epwa.hid: navigator.hid, HIDDevice, inputreport, connect/disconnect. |
| `navigator.mediaDevices.getDisplayMedia` |  | always | Screen sharing is unavailable: the shim rejects with NotSupportedError instead of WebKit hanging or silently capturing the app's own window. |

## Structures

### Rect

| Field | Type | Required |
| --- | --- | --- |
| `x` | number | yes |
| `y` | number | yes |
| `width` | number | yes |
| `height` | number | yes |

### TrafficLights

| Field | Type | Required |
| --- | --- | --- |
| `visible` | boolean | yes |
| `offsetX` | number | yes |
| `offsetY` | number | yes |
| `color` | `light` \| `dark` \| `auto` | yes |

### WindowState

| Field | Type | Required |
| --- | --- | --- |
| `focused` | boolean | yes |
| `maximized` | boolean | yes |
| `fullscreen` | boolean | yes |
| `minimized` | boolean | yes |
| `alwaysOnTop` | boolean | yes |
| `width` | number | yes |
| `height` | number | yes |

### MenuItem

A menu item, or { separator: true }.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | no |
| `title` | string | no |
| `key` | string | no |
| `modifiers` | `cmd` \| `shift` \| `alt` \| `ctrl`[] | no |
| `enabled` | boolean | no |
| `checked` | boolean | no |
| `separator` | boolean | no |

### MenuSpec

| Field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `items` | [MenuItem](#menuitem)[] | yes |

### StatusItemSpec

| Field | Type | Required |
| --- | --- | --- |
| `symbol` | string | no |
| `title` | string | no |
| `tooltip` | string | no |
| `items` | [MenuItem](#menuitem)[] | no |

### ShortcutSpec

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `key` | string | yes |
| `modifiers` | string[] | no |

### AboutLink

| Field | Type | Required |
| --- | --- | --- |
| `title` | string | yes |
| `url` | string | yes |

### Handle

Opaque file handle from dialog.open/save, fs.appData or launch files.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |

### DirEntry

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |
| `size` | integer | yes |
| `modified` | number | yes |

### StatEntry

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `kind` | `file` \| `directory` | yes |
| `size` | integer | yes |
| `modified` | number | yes |
| `created` | number | yes |

### NetStatus

| Field | Type | Required |
| --- | --- | --- |
| `online` | boolean | yes |
| `expensive` | boolean | yes |
| `constrained` | boolean | yes |
| `interfaces` | `wifi` \| `wired` \| `cellular` \| `other`[] | yes |

### NetService

A Bonjour service instance found by net.browse.

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | string | yes |
| `domain` | string | yes |

### SerialPort

| Field | Type | Required |
| --- | --- | --- |
| `path` | string | yes |
| `name` | string | yes |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `serialNumber` | string | no |

### UsbDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `vendorId` | integer | yes |
| `productId` | integer | yes |
| `productName` | string | no |
| `manufacturerName` | string | no |
| `serialNumber` | string | no |
| `deviceClass` | integer | no |

### UsbFilter

| Field | Type | Required |
| --- | --- | --- |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `classCode` | integer | no |

### HidReport

A report inside a collection; reportSize is the body length in bytes.

| Field | Type | Required |
| --- | --- | --- |
| `reportId` | integer | yes |
| `reportSize` | integer | yes |

### HidCollection

A top-level collection of the device.

| Field | Type | Required |
| --- | --- | --- |
| `usagePage` | integer | yes |
| `usage` | integer | yes |
| `inputReports` | [HidReport](#hidreport)[] | yes |
| `outputReports` | [HidReport](#hidreport)[] | yes |
| `featureReports` | [HidReport](#hidreport)[] | yes |

### HidDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `vendorId` | integer | yes |
| `productId` | integer | yes |
| `productName` | string | no |
| `serialNumber` | string | no |
| `collections` | [HidCollection](#hidcollection)[] | yes |

### HidFilter

| Field | Type | Required |
| --- | --- | --- |
| `vendorId` | integer | no |
| `productId` | integer | no |
| `usagePage` | integer | no |
| `usage` | integer | no |

### BluetoothDevice

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |

### BluetoothFilter

| Field | Type | Required |
| --- | --- | --- |
| `services` | string[] | no |
| `name` | string | no |
| `namePrefix` | string | no |

### BluetoothService

| Field | Type | Required |
| --- | --- | --- |
| `uuid` | string | yes |
| `characteristics` | { uuid: string, properties: string[] }[] | yes |

### MidiPort

A MIDI port as midi.access lists it.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `manufacturer` | string | yes |
| `connected` | boolean | yes |

### MidiPortState

A MIDI port in a midi-statechange payload: same fields plus its direction.

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `name` | string | yes |
| `manufacturer` | string | yes |
| `type` | `input` \| `output` | yes |
| `connected` | boolean | yes |

### Coords

| Field | Type | Required |
| --- | --- | --- |
| `latitude` | number | yes |
| `longitude` | number | yes |
| `accuracy` | number | yes |
| `altitude` | number | no |
| `altitudeAccuracy` | number | no |
| `speed` | number | no |
| `heading` | number | no |

### Position

| Field | Type | Required |
| --- | --- | --- |
| `coords` | [Coords](#coords) | yes |
| `timestamp` | number | yes |

### PermissionState

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `declared` | boolean | yes |
| `state` | `granted` \| `prompt` \| `denied` | yes |

### NotificationAction

| Field | Type | Required |
| --- | --- | --- |
| `id` | string | yes |
| `title` | string | yes |
| `destructive` | boolean | no |

### NotificationAttachment

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | no |
| `data` | string | no |
| `handle` | string | no |

### NotificationSchedule

| Field | Type | Required |
| --- | --- | --- |
| `at` | number | no |
| `seconds` | number | no |

### LaunchAtLogin

| Field | Type | Required |
| --- | --- | --- |
| `enabled` | boolean | yes |
| `state` | `enabled` \| `disabled` \| `requiresApproval` \| `notFound` | yes |

### AppRecord

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `bundleId` | string | yes |
| `path` | string | yes |
| `startURL` | string \| null | yes |
| `manifestURL` | string \| null | yes |
| `permissions` | string[] | yes |
| `icon` | string \| null | yes |

### DiagnosticsApp

| Field | Type | Required |
| --- | --- | --- |
| `bundleId` | string | yes |
| `name` | string | yes |
| `runtimeVersion` | string \| null | yes |
| `hostVersion` | string \| null | yes |
| `outdated` | boolean | yes |
| `permissions` | string[] | yes |

### Binary

Binary payload on the wire.

| Field | Type | Required |
| --- | --- | --- |
| `data` | string | yes |
| `encoding` | `utf8` \| `base64` | yes |

### DragItem

Page data for a drag session: a MIME type or UTI and its string payload.

| Field | Type | Required |
| --- | --- | --- |
| `type` | string | yes |
| `data` | string | yes |

### DragSource

A page area that can be dragged out of the window.

| Field | Type | Required |
| --- | --- | --- |
| `rect` | [Rect](#rect) | yes |
| `files` | handle[] | no |
| `items` | [DragItem](#dragitem)[] | no |
| `image` | string | no |

### ClipboardItem

One representation of clipboard content.

| Field | Type | Required |
| --- | --- | --- |
| `type` | `text/plain` \| `text/html` \| `image/png` \| `text/uri-list` \| `application/x-epwa-file` | yes |
| `data` | string | no |
| `encoding` | `utf8` \| `base64` | no |
| `handle` | [Handle](#handle) | no |

