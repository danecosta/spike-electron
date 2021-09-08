import { Component, OnInit } from '@angular/core';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private ipc: IpcRenderer
  private fs: any
  private path: any
  private shell: any

  nomeNovoArquivo: string;
  nomeNovoDir: string;
  novoNomeArquivo: string;
  currentPath: string;
  entries: Array<string>;

  constructor() {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.shell = (<any>window).require('electron').shell
        this.fs = (<any>window).require("fs");
        this.path = (<any>window).require("path");
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }

  ngOnInit() {
    this.currentPath = process.cwd();
    this.updateEntries();
  }

  private updateEntries() {
    this.fs.readdir(this.currentPath, (err: Error, files: [string]) => {
      if (err) throw err;
      this.entries = ['../'].concat(files);
    });
  }

  public changeDir(newDir: string) {
    const targetPath = this.path.resolve(this.currentPath, newDir);
    console.log("old path " + this.currentPath)
    console.log("new path" + targetPath)
    this.fs.stat(targetPath, (err: Error, stats: any) => {
      if (err) throw err;

      if (stats.isFile()) {
        this.openFile(targetPath);
      } else if (stats.isDirectory()) {
        this.currentPath = targetPath;
        this.updateEntries();
      } else {
        console.error(new Error(`Unknown file system object: ${targetPath}`));
      }

    });
  }

  openFile(path: string) {
    console.log("Open file");
    this.shell.openPath(path);
    return
  }

  openModal() {
    console.log("Open a modal");
    this.ipc.send("openModal");
  }

  newFile() {
    console.log("New file");

    if(!this.nomeNovoArquivo) return;

    let newFile = this.fs.createWriteStream(this.nomeNovoArquivo)
    newFile.write('Conteudo do novo arquivo');

    this.updateEntries();
  }

  newDir() {
    console.log("New Dir");

    this.fs.mkdir(this.currentPath + "\\" + this.nomeNovoDir, { recursive: true }, (err: Error) => {
      if (err) throw err;
    });

    this.updateEntries();
  }

  renamePath(path: string) {
    console.log("Rename Path");
    console.log(path);

    this.fs.rename(path, this.novoNomeArquivo, (err: Error) => {
      if (err) throw err;
      this.novoNomeArquivo = '';
      console.log('Rename complete!');
    });

    this.updateEntries();
  }

  deletePath(path: string) {
    console.log("Delete Path");
    console.log(path);

    this.fs.unlink(path, (err: Error) => {
      if (err) throw err;
      console.log(path + ' was deleted');
    });

    this.updateEntries();
  }
}
