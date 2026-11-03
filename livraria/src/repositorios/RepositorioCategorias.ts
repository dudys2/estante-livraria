import { Categoria } from '../entidades/Categoria.js';
import type { CategoriaDto } from '../nucleo/tipos.js';
import { Repositorio } from './Repositorio.js';

export class RepositorioCategorias extends Repositorio<Categoria, CategoriaDto, { nome: string }> {
    constructor() {
        super('api/categorias.php');
    }

    listar(): Promise<Categoria[]> {
        return this.listarTodos();
    }

    protected paraEntidade(dto: CategoriaDto): Categoria {
        return Categoria.deApi(dto);
    }

    protected paraCorpo(categoria: Categoria): { nome: string } {
        return categoria.paraApi();
    }
}
