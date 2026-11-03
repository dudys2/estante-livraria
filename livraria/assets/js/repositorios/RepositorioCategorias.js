import { Categoria } from '../entidades/Categoria.js';
import { Repositorio } from './Repositorio.js';
export class RepositorioCategorias extends Repositorio {
    constructor() {
        super('api/categorias.php');
    }
    listar() {
        return this.listarTodos();
    }
    paraEntidade(dto) {
        return Categoria.deApi(dto);
    }
    paraCorpo(categoria) {
        return categoria.paraApi();
    }
}
