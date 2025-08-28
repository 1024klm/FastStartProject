export const lamderaStack = {
  files: {
    'src/Frontend.elm': `module Frontend exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Lamdera
import Types exposing (..)


app : { init : Lamdera.Url -> Lamdera.Key -> ( FrontendModel, Cmd FrontendMsg )
      , view : FrontendModel -> Html FrontendMsg
      , update : FrontendMsg -> FrontendModel -> ( FrontendModel, Cmd FrontendMsg )
      , updateFromBackend : ToFrontend -> FrontendModel -> ( FrontendModel, Cmd FrontendMsg )
      , subscriptions : FrontendModel -> Sub FrontendMsg
      , onUrlRequest : Browser.UrlRequest -> FrontendMsg
      , onUrlChange : Lamdera.Url -> FrontendMsg
      }
app =
    Lamdera.frontend
        { init = init
        , view = view
        , update = update
        , updateFromBackend = updateFromBackend
        , subscriptions = subscriptions
        , onUrlRequest = UrlClicked
        , onUrlChange = UrlChanged
        }


init : Lamdera.Url -> Lamdera.Key -> ( FrontendModel, Cmd FrontendMsg )
init url key =
    ( { key = key
      , message = "🚀 PROJECT_NAME - Ready to ship!"
      }
    , Cmd.none
    )


view : FrontendModel -> Html FrontendMsg
view model =
    div [ class "container" ]
        [ h1 [] [ text "PROJECT_NAME" ]
        , p [] [ text model.message ]
        , button [ onClick SendMessage ] [ text "Send to Backend" ]
        ]


update : FrontendMsg -> FrontendModel -> ( FrontendModel, Cmd FrontendMsg )
update msg model =
    case msg of
        UrlClicked _ ->
            ( model, Cmd.none )

        UrlChanged _ ->
            ( model, Cmd.none )

        SendMessage ->
            ( model, Lamdera.sendToBackend UserClickedButton )

        NoOpFrontendMsg ->
            ( model, Cmd.none )


updateFromBackend : ToFrontend -> FrontendModel -> ( FrontendModel, Cmd FrontendMsg )
updateFromBackend msg model =
    case msg of
        MessageFromBackend newMessage ->
            ( { model | message = newMessage }, Cmd.none )

        NoOpToFrontend ->
            ( model, Cmd.none )


subscriptions : FrontendModel -> Sub FrontendMsg
subscriptions _ =
    Sub.none`,
    'src/Backend.elm': `module Backend exposing (..)

import Lamdera exposing (ClientId, SessionId)
import Types exposing (..)


app : { init : ( BackendModel, Cmd BackendMsg )
      , update : BackendMsg -> BackendModel -> ( BackendModel, Cmd BackendMsg )
      , updateFromFrontend : SessionId -> ClientId -> ToBackend -> BackendModel -> ( BackendModel, Cmd BackendMsg )
      , subscriptions : BackendModel -> Sub BackendMsg
      }
app =
    Lamdera.backend
        { init = init
        , update = update
        , updateFromFrontend = updateFromFrontend
        , subscriptions = subscriptions
        }


init : ( BackendModel, Cmd BackendMsg )
init =
    ( { counter = 0 }
    , Cmd.none
    )


update : BackendMsg -> BackendModel -> ( BackendModel, Cmd BackendMsg )
update msg model =
    case msg of
        NoOpBackendMsg ->
            ( model, Cmd.none )


updateFromFrontend : SessionId -> ClientId -> ToBackend -> BackendModel -> ( BackendModel, Cmd BackendMsg )
updateFromFrontend sessionId clientId msg model =
    case msg of
        UserClickedButton ->
            let
                newCounter = model.counter + 1
            in
            ( { model | counter = newCounter }
            , Lamdera.sendToFrontend clientId (MessageFromBackend ("Clicked " ++ String.fromInt newCounter ++ " times"))
            )

        NoOpToBackend ->
            ( model, Cmd.none )


subscriptions : BackendModel -> Sub BackendMsg
subscriptions _ =
    Sub.none`,
    'src/Types.elm': `module Types exposing (..)

import Browser
import Lamdera


type alias FrontendModel =
    { key : Lamdera.Key
    , message : String
    }


type alias BackendModel =
    { counter : Int
    }


type FrontendMsg
    = UrlClicked Browser.UrlRequest
    | UrlChanged Lamdera.Url
    | SendMessage
    | NoOpFrontendMsg


type BackendMsg
    = NoOpBackendMsg


type ToBackend
    = UserClickedButton
    | NoOpToBackend


type ToFrontend
    = MessageFromBackend String
    | NoOpToFrontend`,
    'src/Evergreen/V1/Types.elm': `module Evergreen.V1.Types exposing (..)

import Browser
import Lamdera


type alias FrontendModel =
    { key : Lamdera.Key
    , message : String
    }


type alias BackendModel =
    { counter : Int
    }


type FrontendMsg
    = UrlClicked Browser.UrlRequest
    | UrlChanged Lamdera.Url
    | SendMessage
    | NoOpFrontendMsg


type BackendMsg
    = NoOpBackendMsg


type ToBackend
    = UserClickedButton
    | NoOpToBackend


type ToFrontend
    = MessageFromBackend String
    | NoOpToFrontend`,
    'elm.json': `{
    "type": "application",
    "source-directories": [
        "src"
    ],
    "elm-version": "0.19.1",
    "dependencies": {
        "direct": {
            "elm/browser": "1.0.2",
            "elm/core": "1.0.5",
            "elm/html": "1.0.0",
            "elm/http": "2.0.0",
            "elm/json": "1.1.3",
            "elm/time": "1.0.0",
            "elm/url": "1.0.0",
            "lamdera/codecs": "1.0.0",
            "lamdera/core": "1.0.0"
        },
        "indirect": {
            "elm/bytes": "1.0.8",
            "elm/file": "1.0.5",
            "elm/virtual-dom": "1.0.3"
        }
    },
    "test-dependencies": {
        "direct": {},
        "indirect": {}
    }
}`,
    '.env.example': `# Lamdera environment
LAMDERA_API_KEY=your_api_key_here`,
    'style.css': `/* PROJECT_NAME Styles */

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

button {
    background: #5E85B8;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background: #4A6FA5;
}`
  },
  gitignore: `# Elm/Lamdera
elm-stuff/
.lamdera/
build/
dist/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log`,
  commands: [
    'npm install -g lamdera',
    'lamdera live'
  ]
};