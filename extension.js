// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const GitHubApi = require('github');
const path = require('path');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    
    let sendToGithubGist = vscode.commands.registerCommand('extension.getSelection', function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let selection = editor.selection;
        var selectedText;
        if (selection.isEmpty)
            selectedText = editor.document.getText();
        else
            selectedText = editor.document.getText(selection);

        const github = new GitHubApi({
            debug: true
        });

        var accessToken = context.globalState.get("token");
        if (accessToken != undefined && accessToken != "") {
            github.authenticate({
                type: 'oauth',
                token: accessToken
            });
        }
        else {
            vscode.window.showWarningMessage("If you want add gist to your github account you should get a github personel access token from Github settings page.");
        }


        var fileWithContent = {};
        var selectedTextObj = { 'content': selectedText };
        var exactFileName = path.basename(editor.document.fileName);
        Object.defineProperty(fileWithContent, exactFileName, {
            value: selectedTextObj,
            writable: true,
            configurable: true,
            enumerable: true
        });
        var repoPromise = github.gists.create({
            'files': fileWithContent,
            'description': exactFileName,
            'public': true
        });
        repoPromise.then((data) => {
            var gist = data;
            vscode.window.showInformationMessage("Gist Link: " + gist.data.html_url);
        }).catch((error) => {
            console.log(error);
        });
    });

    let addPersonelGithubToken = vscode.commands.registerCommand('extension.getPersonelGithubToken', function () {
        var inputBoxOptions = {
            'ignoreFocusOut': true,
            'password': true,
            'placeHolder': 'Paste Access token to here'
        }

        var tokenInput = vscode.window.showInputBox(inputBoxOptions);
        if (tokenInput != undefined && tokenInput != "") {
            tokenInput.then((data) => {
                context.globalState.update("token", data);
                vscode.window.showInformationMessage("Access token added with successfully.");
            }).catch((error) => {
                vscode.window.showErrorMessage(error);
            });
        }
        else{
            vscode.window.showInformationMessage("Error: Access token could not be added");
        }

    });

    let removePersonelGithubToken = vscode.commands.registerCommand('extension.removePersonelGithubToken', function () {
        var tokenInput = context.globalState.get("token");
        if (tokenInput != undefined && tokenInput != "") {
            tokenInput = "";
                context.globalState.update("token",tokenInput);
                vscode.window.showInformationMessage("The access token has removed.");
        }
        else{
            vscode.window.showInformationMessage("The access token was not found.");
        }
    });
    context.subscriptions.push(sendToGithubGist);
    context.subscriptions.push(addPersonelGithubToken);
    context.subscriptions.push(removePersonelGithubToken);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;