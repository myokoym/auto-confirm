# Auto Confirm

Pushs any confirmation button automatically.

## Usage

## Examples

### Common dialog

#### Confirm (cancel)

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"confirm"`|maches to dialogs shown by `window.confirm()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"auto-confirm"`|matches to dialog with text including "auto-confirm"|
|extensions.auto-confirm@myokoym.net.common.(identifier).action|`"cancel"`|pushes the cancel button|

#### Confirm (accept)

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"confirm"`|maches to dialogs shown by `window.confirm()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"foo"`|matches to dialog with text including "foo"|
|extensions.auto-confirm@myokoym.net.common.(identifier).action|`"accept"`|pushes the accept button|

#### Prompt

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"prompt"`|maches to dialogs shown by `window.prompt()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"foo"`|matches to dialog with text including "foo"|
|extensions.auto-confirm@myokoym.net.common.(identifier).actions|`["input;bar","accept"]"`|inputs "bar" to textbox and pushes the accept button|

#### Alert

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"alert"`|maches to dialogs shown by `window.alert()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"foo"`|matches to dialog with text including "foo"|
|extensions.auto-confirm@myokoym.net.common.(identifier).action|`"accept"`|pushes the accept button|

#### Check

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"prompt"`|maches to dialogs shown by `prompts.confirmCheck()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"foo"`|matches to dialog with text including "foo"|
|extensions.auto-confirm@myokoym.net.common.(identifier).actions|`["check","accept"]"`|checks the checkbox and pushes the accept button|

#### ConfirmEx

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.common.(identifier).type|`"confirmEx"`|maches to dialogs shown by `prompts.confirmEx()`|
|extensions.auto-confirm@myokoym.net.common.(identifier).text|`"foo"`|matches to dialog with text including "foo"|
|extensions.auto-confirm@myokoym.net.common.(identifier).actions|`"push;bar"`|pushes a button that with label including "bar"|

### general window

#### View Certificate

|key|value|description|
|---|-----|-----------|
|extensions.auto-confirm@myokoym.net.general.(identifier).url|`"chrome://browser/content/pageinfo/pageInfo.xul"`|maches to windows of specified URL|
|extensions.auto-confirm@myokoym.net.general.(identifier).text|`"foo"`|matches to window with any element including "foo"|
|extensions.auto-confirm@myokoym.net.general.(identifier).action|`"click;bar"`|pushes a button that with label including "bar"|
